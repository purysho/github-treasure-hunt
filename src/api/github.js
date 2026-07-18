import {
  cacheResults,
  clearPouch,
  getCachedResults,
  takeRandomUnseen,
} from "../lib/pouch.js";

export const TOPICS = [
  "ai",
  "machine-learning",
  "design",
  "climate",
  "security",
  "game",
  "education",
  "developer-tools",
  "mobile",
  "web",
  "data-science",
];

const DICE_START_YEAR = 2010;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days, now = new Date()) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - days);
  return formatDate(date);
}

export function rollDice(random = Math.random, now = new Date()) {
  const topicRoll = Math.min(Math.max(random(), 0), 0.999999);
  const randomTopic = TOPICS[Math.floor(topicRoll * TOPICS.length)];
  const firstMonth = DICE_START_YEAR * 12;
  const currentMonth = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const latestStartOffset = Math.max(currentMonth - firstMonth - 3, 0);
  const dateRoll = Math.min(Math.max(random(), 0), 0.999999);
  const startOffset = Math.floor(dateRoll * (latestStartOffset + 1));
  const start = new Date(
    Date.UTC(
      DICE_START_YEAR + Math.floor(startOffset / 12),
      startOffset % 12,
      1,
    ),
  );
  const end = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 3, 1),
  );

  return {
    randomTopic,
    randomDateSlice: `${formatDate(start)}..${formatDate(end)}`,
  };
}

export function buildQuery(filters = {}, dice = null, now = new Date()) {
  const parts = [];
  const text = filters.text?.trim().replace(/\s+/g, " ");

  if (text) parts.push(text);
  parts.push("archived:false");

  if (filters.category) parts.push(`topic:${filters.category}`);
  if (filters.starBand) parts.push(`stars:${filters.starBand}`);
  if (filters.pushedAfter) parts.push(`pushed:>${filters.pushedAfter}`);
  if (Number.isFinite(filters.goodFirstIssues)) {
    parts.push(`good-first-issues:>${filters.goodFirstIssues}`);
  }
  if (Number.isFinite(filters.helpWantedIssues)) {
    parts.push(`help-wanted-issues:>${filters.helpWantedIssues}`);
  }
  if (filters.license) parts.push(`license:${filters.license}`);
  if (filters.language) parts.push(`language:${filters.language}`);
  if (Number.isFinite(filters.maxSize)) {
    parts.push(`size:<${filters.maxSize}`);
  }

  if (filters.thirtyMin) {
    parts.push(
      "size:<3000",
      "good-first-issues:>0",
      `pushed:>${daysAgo(90, now)}`,
      "stars:5..300",
    );
  }

  if (dice) {
    if (!filters.category) parts.push(`topic:${dice.randomTopic}`);
    if (!filters.starBand && !filters.thirtyMin) parts.push("stars:>5");
    if (dice.randomDateSlice) {
      parts.push(`created:${dice.randomDateSlice}`);
    }
  }

  return parts.join(" ");
}

export async function searchRepositories(
  filters,
  { dice = null, signal } = {},
) {
  const query = buildQuery(filters, dice);
  const cached = getCachedResults(query);

  if (cached) {
    return {
      fromCache: true,
      items: cached,
      query,
      totalCount: cached.length,
    };
  }

  const url = new URL("https://api.github.com/search/repositories");
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", "30");

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    signal,
  });

  if (!response.ok) {
    throw new Error("GitHub search is unavailable right now.");
  }

  const data = await response.json();
  const items = data.items ?? [];
  cacheResults(query, items);

  return {
    fromCache: false,
    items,
    query,
    totalCount: data.total_count ?? 0,
  };
}

async function searchSurpriseSlice(filters, dice, signal) {
  const primary = await searchRepositories(filters, { dice, signal });

  if (
    primary.totalCount === 0 &&
    !primary.fromCache &&
    dice.randomDateSlice
  ) {
    const fallbackDice = { ...dice, randomDateSlice: "" };
    return {
      dice: fallbackDice,
      result: await searchRepositories(filters, {
        dice: fallbackDice,
        signal,
      }),
    };
  }

  return { dice, result: primary };
}

export async function surpriseRepository(
  filters,
  { dice = null, random = Math.random, signal } = {},
) {
  let activeDice = dice ?? rollDice(random);
  const isEligible = filters.thirtyMin
    ? (repository) => Boolean(repository.description)
    : () => true;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const searched = await searchSurpriseSlice(filters, activeDice, signal);
    activeDice = searched.dice;
    const repository = takeRandomUnseen(
      searched.result.query,
      random,
      isEligible,
    );

    if (repository) {
      return { dice: activeDice, message: "", repository };
    }

    if (
      searched.result.totalCount === 0 &&
      !searched.result.fromCache
    ) {
      break;
    }

    activeDice = rollDice(random);
  }

  return {
    dice: null,
    message: "No gems here — loosen a filter.",
    repository: null,
  };
}

if (import.meta.vitest) {
  const { afterEach, describe, expect, it, vi } = import.meta.vitest;

  afterEach(() => {
    clearPouch();
    vi.unstubAllGlobals();
  });

  describe("buildQuery", () => {
    it("covers every repository qualifier in section 5.1", () => {
      expect(
        buildQuery({
          text: "  accessibility   tools ",
          category: "climate",
          starBand: "<100",
          pushedAfter: "2026-01-02",
          goodFirstIssues: 2,
          helpWantedIssues: 1,
          license: "mit",
          language: "rust",
          maxSize: 3000,
        }),
      ).toBe(
        "accessibility tools archived:false topic:climate stars:<100 " +
          "pushed:>2026-01-02 good-first-issues:>2 help-wanted-issues:>1 " +
          "license:mit language:rust size:<3000",
      );
    });

    it("adds the 30-minute recipe with a deterministic date", () => {
      expect(
        buildQuery(
          { thirtyMin: true },
          null,
          new Date("2026-07-19T12:00:00Z"),
        ),
      ).toBe(
        "archived:false size:<3000 good-first-issues:>0 " +
          "pushed:>2026-04-20 stars:5..300",
      );
    });

    it("lets active filters override only their dice dimensions", () => {
      expect(
        buildQuery(
          { category: "climate", starBand: "<100" },
          {
            randomTopic: "ai",
            randomDateSlice: "2019-03-01..2019-06-01",
          },
        ),
      ).toBe(
        "archived:false topic:climate stars:<100 " +
          "created:2019-03-01..2019-06-01",
      );
    });

    it("uses the dice topic and quality floor when filters leave them open", () => {
      expect(
        buildQuery(
          {},
          {
            randomTopic: "design",
            randomDateSlice: "2019-03-01..2019-06-01",
          },
        ),
      ).toBe(
        "archived:false topic:design stars:>5 " +
          "created:2019-03-01..2019-06-01",
      );
    });
  });

  describe("rollDice", () => {
    it("returns a curated topic and a three-month date slice", () => {
      const rolls = [0, 0];
      const dice = rollDice(
        () => rolls.shift(),
        new Date("2026-07-19T12:00:00Z"),
      );

      expect(dice).toEqual({
        randomTopic: "ai",
        randomDateSlice: "2010-01-01..2010-04-01",
      });
    });
  });

  describe("searchRepositories", () => {
    it("hits the pouch for a repeated filter combination", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: async () => ({
          items: [{ id: 1, full_name: "example/gem" }],
          total_count: 1,
        }),
        ok: true,
      });
      vi.stubGlobal("fetch", fetchMock);

      const first = await searchRepositories({
        category: "climate",
        starBand: "<100",
      });
      const second = await searchRepositories({
        category: "climate",
        starBand: "<100",
      });

      expect(first.fromCache).toBe(false);
      expect(second.fromCache).toBe(true);
      expect(second.items).toEqual(first.items);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("serves 30 surprises from one network response", async () => {
      const items = Array.from({ length: 30 }, (_, index) => ({
        description: `Gem ${index + 1}`,
        id: index + 1,
      }));
      const fetchMock = vi.fn().mockResolvedValue({
        json: async () => ({ items, total_count: 30 }),
        ok: true,
      });
      vi.stubGlobal("fetch", fetchMock);
      let dice = null;
      const ids = [];

      for (let index = 0; index < 30; index += 1) {
        const result = await surpriseRepository(
          {},
          { dice, random: () => 0 },
        );
        dice = result.dice;
        ids.push(result.repository.id);
      }

      expect(new Set(ids).size).toBe(30);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("retries one time without the date slice for empty results", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: async () => ({ items: [], total_count: 0 }),
        ok: true,
      });
      vi.stubGlobal("fetch", fetchMock);

      const result = await surpriseRepository({}, { random: () => 0 });

      expect(result).toMatchObject({
        message: "No gems here — loosen a filter.",
        repository: null,
      });
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[1][0].search).not.toContain("created%3A");
    });
  });
}
