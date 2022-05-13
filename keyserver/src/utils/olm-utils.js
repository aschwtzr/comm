// @flow

import { importJSON } from './import-json';

type OlmConfig = {
  +picklingKey: string,
  +pickledAccount: string,
};

async function getOlmConfig(): Promise<OlmConfig> {
  return await importJSON('secrets/olm_config');
}

export { getOlmConfig };
