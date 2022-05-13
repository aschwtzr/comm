// @flow

// If we return mixed here, we're just forcing our callers to any-cast our
// result. Returning any here is unfortunately unavoidable
const cachedJSON = new Map();
async function importJSON(path: string): Promise<any> {
  const cached = cachedJSON.get(path);
  if (cached !== undefined) {
    return cached;
  }
  try {
    // $FlowFixMe
    const importedJSON = await import(`../../${path}`);
    if (!cachedJSON.has(path)) {
      cachedJSON.set(path, importedJSON.default);
    }
  } catch {
    if (!cachedJSON.has(path)) {
      cachedJSON.set(path, null);
    }
  }
  return cachedJSON.get(path);
}

export { importJSON };
