// Treasure Hunt → Lodestar link-builder (brief §6).
//
// Maps a GitHub repo (already in hand) to a star payload and builds the
// Lodestar add-URL. Encoding + field contract come verbatim from starLink.js;
// this file only does the repo → payload mapping and sets origin.

import { buildAddUrl, buildStarPayload } from './starLink.js'

export function repoToStarPayload(repository) {
  return buildStarPayload({
    title: repository.full_name,
    note: repository.description ?? '',
    tags: [...(repository.topics ?? []), repository.language].filter(Boolean),
    url: repository.html_url,
    origin: 'treasure-hunt',
  })
}

export function buildRepoStarUrl(repository) {
  return buildAddUrl(repoToStarPayload(repository))
}
