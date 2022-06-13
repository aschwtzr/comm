// @flow

import childProcess from 'child_process';
import dateFormat from 'dateformat';
import fs from 'fs';
import invariant from 'invariant';
import { ReReadable } from 'rereadable-stream';
import { PassThrough } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';

import { getDBConfig, type DBConfig } from '../database/db-config';
import { importJSON } from '../utils/import-json';

const readdir = promisify(fs.readdir);
const lstat = promisify(fs.lstat);
const unlink = promisify(fs.unlink);

type BackupConfig = {
  +enabled: boolean,
  +directory: string,
};

function getBackupConfig(): Promise<?BackupConfig> {
  return importJSON({ folder: 'facts', name: 'backups' });
}

async function backupDB() {
  const [backupConfig, dbConfig] = await Promise.all([
    getBackupConfig(),
    getDBConfig(),
  ]);

  if (!backupConfig || !backupConfig.enabled) {
    return;
  }

  const dateString = dateFormat('yyyy-mm-dd-HH:MM');
  const filename = `comm.${dateString}.sql.gz`;
  const filePath = `${backupConfig.directory}/${filename}`;

  const rawStream = new PassThrough();
  (async () => {
    try {
      await mysqldump(dbConfig, filename, rawStream, ['--no-data'], {
        end: false,
      });
    } catch {}
    try {
      const ignoreReports = `--ignore-table=${dbConfig.database}.reports`;
      await mysqldump(dbConfig, filename, rawStream, [
        '--no-create-info',
        ignoreReports,
      ]);
    } catch {
      rawStream.end();
    }
  })();

  const gzippedBuffer = new ReReadable();
  rawStream
    .on('error', (e: Error) => {
      console.warn(`mysqldump stdout stream emitted error for ${filename}`, e);
    })
    .pipe(zlib.createGzip())
    .on('error', (e: Error) => {
      console.warn(`gzip transform stream emitted error for ${filename}`, e);
    })
    .pipe(gzippedBuffer);

  try {
    await saveBackup(filename, filePath, gzippedBuffer);
  } catch (e) {
    console.warn(`saveBackup threw for ${filename}`, e);
    await unlink(filePath);
  }
}

function mysqldump(
  dbConfig: DBConfig,
  filename: string,
  rawStream: PassThrough,
  extraParams: $ReadOnlyArray<string>,
  pipeParams?: { end?: boolean, ... },
): Promise<void> {
  const mysqlDump = childProcess.spawn(
    'mysqldump',
    [
      '-h',
      dbConfig.host,
      '-u',
      dbConfig.user,
      `-p${dbConfig.password}`,
      '--single-transaction',
      '--no-tablespaces',
      '--default-character-set=utf8mb4',
      ...extraParams,
      dbConfig.database,
    ],
    {
      stdio: ['ignore', 'pipe', 'ignore'],
    },
  );
  const extraParamsString = extraParams.join(' ');
  return new Promise((resolve, reject) => {
    mysqlDump.on('error', (e: Error) => {
      console.warn(
        `error trying to spawn mysqldump ${extraParamsString} for ${filename}`,
        e,
      );
      reject(e);
    });
    mysqlDump.on('exit', (code: number | null, signal: string | null) => {
      if (signal !== null && signal !== undefined) {
        console.warn(
          `mysqldump ${extraParamsString} received signal ${signal} for ` +
            filename,
        );
        reject(new Error(`mysqldump ${JSON.stringify({ code, signal })}`));
      } else if (code !== null && code !== 0) {
        console.warn(
          `mysqldump ${extraParamsString} exited with code ${code} for ` +
            filename,
        );
        reject(new Error(`mysqldump ${JSON.stringify({ code, signal })}`));
      }
      resolve();
    });
    mysqlDump.stdout.pipe(rawStream, pipeParams);
  });
}

async function saveBackup(
  filename: string,
  filePath: string,
  gzippedBuffer: ReReadable,
  retries: number = 2,
): Promise<void> {
  try {
    await trySaveBackup(filename, filePath, gzippedBuffer);
  } catch (saveError) {
    if (saveError.code !== 'ENOSPC') {
      throw saveError;
    }
    if (!retries) {
      throw saveError;
    }
    try {
      await deleteOldestBackup();
    } catch (deleteError) {
      if (deleteError.message === 'no_backups_left') {
        throw saveError;
      } else {
        throw deleteError;
      }
    }
    await saveBackup(filename, filePath, gzippedBuffer, retries - 1);
  }
}

const backupWatchFrequency = 60 * 1000;
function trySaveBackup(
  filename: string,
  filePath: string,
  gzippedBuffer: ReReadable,
): Promise<void> {
  const timeoutObject: { timeout: ?TimeoutID } = { timeout: null };
  const setBackupTimeout = (alreadyWaited: number) => {
    timeoutObject.timeout = setTimeout(() => {
      const nowWaited = alreadyWaited + backupWatchFrequency;
      console.log(
        `writing backup for ${filename} has taken ${nowWaited}ms so far`,
      );
      setBackupTimeout(nowWaited);
    }, backupWatchFrequency);
  };
  setBackupTimeout(0);

  const writeStream = fs.createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    gzippedBuffer
      .rewind()
      .pipe(writeStream)
      .on('finish', () => {
        clearTimeout(timeoutObject.timeout);
        resolve();
      })
      .on('error', (e: Error) => {
        clearTimeout(timeoutObject.timeout);
        console.warn(`write stream emitted error for ${filename}`, e);
        reject(e);
      });
  });
}

async function deleteOldestBackup() {
  const [backupConfig, backupInfos] = await Promise.all([
    getBackupConfig(),
    getBackupInfos(),
  ]);

  invariant(backupConfig, 'backupConfig should be non-null');
  if (backupInfos.length === 0) {
    throw new Error('no_backups_left');
  }

  const oldestFilename = backupInfos[0].filename;
  try {
    await unlink(`${backupConfig.directory}/${oldestFilename}`);
  } catch (e) {
    // Check if it's already been deleted
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }
}

type BackupInfo = {
  +filename: string,
  +lastModifiedTime: number,
  +bytes: number,
};
async function getBackupInfos(): Promise<BackupInfo[]> {
  const backupConfig = await getBackupConfig();
  invariant(backupConfig, 'backupConfig should be non-null');

  const filenames = await readdir(backupConfig.directory);
  const backups = await Promise.all(
    filenames.map(async filename => {
      if (!filename.endsWith('.sql.gz') || !filename.startsWith('comm.')) {
        return null;
      }
      const stats = await lstat(`${backupConfig.directory}/${filename}`);
      if (stats.isDirectory()) {
        return null;
      }
      return {
        filename,
        lastModifiedTime: stats.mtime,
        bytes: stats.size,
      };
    }),
  );

  const filteredBackups = backups.filter(Boolean);
  filteredBackups.sort((a, b) => a.lastModifiedTime - b.lastModifiedTime);
  return filteredBackups;
}

export { backupDB };
