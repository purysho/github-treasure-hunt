const cachedResults = new Map();
const seenRepositoryIds = new Set();

export function getCachedResults(query) {
  if (!cachedResults.has(query)) return null;
  return [...cachedResults.get(query)];
}

export function cacheResults(query, results) {
  cachedResults.set(query, [...results]);
}

export function clearPouch() {
  cachedResults.clear();
  seenRepositoryIds.clear();
}

export function takeRandomUnseen(
  query,
  random = Math.random,
  predicate = () => true,
) {
  const results = cachedResults.get(query);
  if (!results) return null;

  const candidates = results.filter(
    (repository) =>
      !seenRepositoryIds.has(repository.id) && predicate(repository),
  );
  if (candidates.length === 0) return null;

  const roll = Math.min(Math.max(random(), 0), 0.999999);
  const repository = candidates[Math.floor(roll * candidates.length)];
  const index = results.findIndex((item) => item.id === repository.id);
  results.splice(index, 1);
  seenRepositoryIds.add(repository.id);

  return repository;
}

if (import.meta.vitest) {
  const { afterEach, describe, expect, it } = import.meta.vitest;

  afterEach(clearPouch);

  describe("pouch", () => {
    it("pops every repository once before the query is empty", () => {
      const results = Array.from({ length: 30 }, (_, index) => ({
        id: index + 1,
      }));
      cacheResults("query", results);

      const popped = Array.from({ length: 30 }, () =>
        takeRandomUnseen("query", () => 0),
      );

      expect(new Set(popped.map(({ id }) => id)).size).toBe(30);
      expect(takeRandomUnseen("query", () => 0)).toBeNull();
    });

    it("tracks seen repository IDs across different queries", () => {
      cacheResults("first", [{ id: 1 }]);
      cacheResults("second", [{ id: 1 }, { id: 2 }]);

      expect(takeRandomUnseen("first", () => 0)?.id).toBe(1);
      expect(takeRandomUnseen("second", () => 0)?.id).toBe(2);
    });
  });
}
