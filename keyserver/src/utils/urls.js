// @flow

import invariant from 'invariant';

import { values } from 'lib/utils/objects';

import { importJSON } from './import-json';

export type AppURLFacts = {
  +baseDomain: string,
  +basePath: string,
  +https: boolean,
  +baseRoutePath: string,
};
const sitesObj = Object.freeze({
  a: 'landing',
  b: 'commapp',
  c: 'squadcal',
});
export type Site = $Values<typeof sitesObj>;
const sites: $ReadOnlyArray<Site> = values(sitesObj);

const cachedURLFacts = new Map();
async function fetchURLFacts(site: Site): Promise<?AppURLFacts> {
  const existing = cachedURLFacts.get(site);
  if (existing !== undefined) {
    return existing;
  }
  const urlFacts: ?AppURLFacts = await importJSON(`facts/${site}_url`);
  cachedURLFacts.set(site, urlFacts);
  return urlFacts;
}

async function prefetchAllURLFacts() {
  await Promise.all(sites.map(fetchURLFacts));
}

function getSquadCalURLFacts(): ?AppURLFacts {
  return cachedURLFacts.get('squadcal');
}

function getCommAppURLFacts(): ?AppURLFacts {
  return cachedURLFacts.get('commapp');
}

function getAndAssertCommAppURLFacts(): AppURLFacts {
  const urlFacts = getCommAppURLFacts();
  invariant(urlFacts, 'keyserver/facts/commapp_url.json missing');
  return urlFacts;
}

function getAppURLFactsFromRequestURL(url: string): AppURLFacts {
  const commURLFacts = getCommAppURLFacts();
  if (commURLFacts && url.startsWith(commURLFacts.baseRoutePath)) {
    return commURLFacts;
  }
  const squadCalURLFacts = getSquadCalURLFacts();
  if (squadCalURLFacts) {
    return squadCalURLFacts;
  }
  invariant(false, 'request received but no URL facts are present');
}

function getLandingURLFacts(): ?AppURLFacts {
  return cachedURLFacts.get('landing');
}

function getAndAssertLandingURLFacts(): AppURLFacts {
  const urlFacts = getLandingURLFacts();
  invariant(urlFacts, 'keyserver/facts/landing_url.json missing');
  return urlFacts;
}

function clientPathFromRouterPath(
  routerPath: string,
  urlFacts: AppURLFacts,
): string {
  const { basePath } = urlFacts;
  return basePath + routerPath;
}

export {
  prefetchAllURLFacts,
  getSquadCalURLFacts,
  getCommAppURLFacts,
  getAndAssertCommAppURLFacts,
  getLandingURLFacts,
  getAndAssertLandingURLFacts,
  getAppURLFactsFromRequestURL,
  clientPathFromRouterPath,
};
