import { describe, expect, it } from 'vitest'

import { LODESTAR_ADD_URL, decodeStarPayload } from './starLink.js'
import { buildRepoStarUrl, repoToStarPayload } from './sendToSky.js'

const repository = {
  full_name: 'fernwood/solarpunk-grid',
  description: 'An off-grid solarpunk energy simulator',
  language: 'Rust',
  topics: ['climate', 'energy', 'simulation'],
  html_url: 'https://github.com/fernwood/solarpunk-grid',
}

describe('treasure-hunt → sky link-builder', () => {
  it('builds a Lodestar add-URL that decodes back to the exact payload', () => {
    const url = buildRepoStarUrl(repository)
    expect(url.startsWith(LODESTAR_ADD_URL)).toBe(true)

    const decoded = decodeStarPayload(url.slice(LODESTAR_ADD_URL.length))
    expect(decoded).toEqual(repoToStarPayload(repository))
  })

  it('maps repo fields to the star payload with origin "treasure-hunt"', () => {
    const payload = repoToStarPayload(repository)
    expect(payload.v).toBe(1)
    expect(payload.title).toBe('fernwood/solarpunk-grid')
    expect(payload.note).toBe('An off-grid solarpunk energy simulator')
    expect(payload.url).toBe('https://github.com/fernwood/solarpunk-grid')
    expect(payload.origin).toBe('treasure-hunt')
    // topics + language, sanitized (lowercased, deduped) by the contract.
    expect(payload.tags).toEqual(['climate', 'energy', 'simulation', 'rust'])
  })

  it('tolerates a repo with no description or topics', () => {
    const bare = {
      full_name: 'octocat/hello',
      html_url: 'https://github.com/octocat/hello',
    }
    const payload = repoToStarPayload(bare)
    expect(payload.title).toBe('octocat/hello')
    expect(payload.note).toBe('')
    expect(payload.tags).toEqual([])
    expect(payload.origin).toBe('treasure-hunt')
  })
})
