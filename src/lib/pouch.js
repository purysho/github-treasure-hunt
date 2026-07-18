const cachedResults = new Map();

export function getCachedResults(query) {
  if (!cachedResults.has(query)) return null;
  return [...cachedResults.get(query)];
}

export function cacheResults(query, results) {
  cachedResults.set(query, [...results]);
}

export function clearPouch() {
  cachedResults.clear();
}
