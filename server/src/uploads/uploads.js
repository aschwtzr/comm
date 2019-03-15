// @flow

import type { Viewer } from '../session/viewer';
import type { $Request } from 'express';
import type {
  UploadMultimediaResult,
  UploadDeletionRequest,
} from 'lib/types/media-types';

import multer from 'multer';
import fileType from 'file-type';

import { fileInfoFromData } from 'lib/utils/media-utils';
import { ServerError } from 'lib/utils/errors';

import createUploads from '../creators/upload-creator';
import { fetchUpload } from '../fetchers/upload-fetchers';
import { deleteUpload } from '../deleters/upload-deleters';

const upload = multer();
const multerProcessor = upload.array('multimedia');

type MulterFile = {|
  fieldname: string,
  originalname: string,
  encoding: string,
  mimetype: string,
  buffer: Buffer,
  size: number,
|};

type MultimediaUploadResult = {|
  results: UploadMultimediaResult[],
|};
async function multimediaUploadResponder(
  viewer: Viewer,
  req: $Request & { files?: $ReadOnlyArray<MulterFile> },
): Promise<MultimediaUploadResult> {
  const { files } = req;
  if (!files) {
    throw new ServerError('invalid_parameters');
  }
  const uploadInfos = files.map(multerFile => {
    const { buffer, originalname } = multerFile;
    const fileInfo = fileInfoFromData(buffer, originalname);
    if (!fileInfo) {
      return null;
    }
    return { ...fileInfo, buffer };
  }).filter(Boolean);
  if (uploadInfos.length === 0) {
    throw new ServerError('invalid_parameters');
  }
  const results = await createUploads(viewer, uploadInfos);
  return { results };
}

async function uploadDownloadResponder(
  viewer: Viewer,
  req: $Request,
  res: $Response,
): Promise<void> {
  const { uploadID, secret } = req.params;
  if (!uploadID || !secret) {
    throw new ServerError('invalid_parameters');
  }
  const { content, mime } = await fetchUpload(viewer, uploadID, secret);
  res.type(mime);
  res.set('Cache-Control', 'public, max-age=31557600, immutable');
  res.send(content);
}

async function uploadDeletionResponder(
  viewer: Viewer,
  request: UploadDeletionRequest,
): Promise<void> {
  const { id } = request;
  await deleteUpload(viewer, id);
}

export {
  multerProcessor,
  multimediaUploadResponder,
  uploadDownloadResponder,
  uploadDeletionResponder,
};
