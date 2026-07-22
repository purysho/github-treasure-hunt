// ─────────────────────────────────────────────────────────────────────────
// THE SHARED "STAR LINK" CONTRACT — v1   (Trilogy Wiring brief §4)
//
// FROZEN SPEC. This file is copied VERBATIM into all three trilogy repos:
//   • purysho/lodestar              (receiver)
//   • purysho/github-treasure-hunt  (sender, origin "treasure-hunt")
//   • purysho/open-question-atlas   (sender, origin "atlas")
//
// Any drift between a sender's encode and Lodestar's decode silently breaks
// the handoff. DO NOT edit one copy without changing all three.
//
// Payload (pre-encoding) maps 1:1 to Lodestar's star schema:
//   { v: 1, title, note, tags: string[], url, origin }
// Lodestar assigns id / x / y / createdAt on arrival — never trust those from
// a payload.
//
// Encoding : encodeURIComponent(JSON.stringify(payload))   (v1: simple, unicode-safe)
// Wire     : https://purysho.github.io/lodestar/#/add?s=<encoded>
// ─────────────────────────────────────────────────────────────────────────

export const STAR_LINK_VERSION = 1

// origin enum — senders set their own; powers per-origin styling/filtering later.
export const STAR_ORIGINS = Object.freeze(['treasure-hunt', 'atlas', 'manual'])

// The single cross-app constant the senders hardcode (one named constant each).
export const LODESTAR_ADD_URL = 'https://purysho.github.io/lodestar/#/add?s='

// Size caps — guard against oversized/abusive payloads on both ends.
export const STAR_LINK_LIMITS = Object.freeze({
  title: 200,
  note: 280,
  url: 2048,
  tagCount: 12,
  tagLength: 40,
  encoded: 2048, // ~2KB cap on the encoded string
})

// Strip control characters, trim, and cap length.
function sanitizeString(value, max) {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  const cleaned = value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > max ? cleaned.slice(0, max).trim() : cleaned
}

function sanitizeTags(tags) {
  if (!Array.isArray(tags)) return []
  const out = []
  const seen = new Set()

  for (const tag of tags) {
    const clean = sanitizeString(tag, STAR_LINK_LIMITS.tagLength).toLowerCase()
    if (!clean || seen.has(clean)) continue
    seen.add(clean)
    out.push(clean)
    if (out.length >= STAR_LINK_LIMITS.tagCount) break
  }

  return out
}

// A valid http(s) URL (normalized), or '' when absent/invalid.
export function sanitizeUrl(value) {
  const clean = sanitizeString(value, STAR_LINK_LIMITS.url)
  if (!clean) return ''

  try {
    const url = new URL(clean)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : ''
  } catch {
    return ''
  }
}

export function encodeStarPayload(payload) {
  return encodeURIComponent(JSON.stringify(payload))
}

export function decodeStarPayload(encoded) {
  return JSON.parse(decodeURIComponent(encoded))
}

// Build a canonical, size-guarded payload from raw sender inputs. If the
// encoded payload would exceed the cap, shed non-essential fields (note, then
// tags) rather than producing a broken link.
export function buildStarPayload({ title, note, tags, url, origin } = {}) {
  let payload = {
    v: STAR_LINK_VERSION,
    title: sanitizeString(title, STAR_LINK_LIMITS.title),
    note: sanitizeString(note, STAR_LINK_LIMITS.note),
    tags: sanitizeTags(tags),
    url: sanitizeUrl(url),
    origin: STAR_ORIGINS.includes(origin) ? origin : 'manual',
  }

  if (encodeStarPayload(payload).length > STAR_LINK_LIMITS.encoded) {
    payload = { ...payload, note: '' }
  }
  while (payload.tags.length > 0 && encodeStarPayload(payload).length > STAR_LINK_LIMITS.encoded) {
    payload = { ...payload, tags: payload.tags.slice(0, -1) }
  }

  return payload
}

// Sender helper: the full Lodestar add-URL for a payload.
export function buildAddUrl(payload) {
  return `${LODESTAR_ADD_URL}${encodeStarPayload(payload)}`
}

// ── Receiver side (Lodestar) ──────────────────────────────────────────────

// Reject an oversized encoded string before decoding.
export function isEncodedPayloadTooLarge(encoded) {
  return typeof encoded !== 'string' || encoded.length > STAR_LINK_LIMITS.encoded
}

// Validate + sanitize an UNTRUSTED decoded payload. Returns
// { ok: true, payload } with a clean payload, or { ok: false, error }.
export function validateStarPayload(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'not-an-object' }
  }
  if (raw.v !== STAR_LINK_VERSION) {
    return { ok: false, error: 'unknown-version' }
  }

  const title = sanitizeString(raw.title, STAR_LINK_LIMITS.title)
  if (!title) return { ok: false, error: 'missing-title' }

  if (raw.tags !== undefined && !Array.isArray(raw.tags)) {
    return { ok: false, error: 'invalid-tags' }
  }

  if (!STAR_ORIGINS.includes(raw.origin)) {
    return { ok: false, error: 'invalid-origin' }
  }

  const urlProvided = typeof raw.url === 'string' && raw.url.trim() !== ''
  const url = sanitizeUrl(raw.url)
  if (urlProvided && !url) return { ok: false, error: 'invalid-url' }

  return {
    ok: true,
    payload: {
      v: STAR_LINK_VERSION,
      title,
      note: sanitizeString(raw.note, STAR_LINK_LIMITS.note),
      tags: sanitizeTags(raw.tags),
      url,
      origin: raw.origin,
    },
  }
}

// Idempotency key: origin + normalized url, or origin + lowercased title when
// there is no url. Refresh / back / re-share collapse to the same key.
export function dedupeKey({ origin, url, title } = {}) {
  const normalizedUrl = sanitizeUrl(url)
  const keyPart = normalizedUrl
    ? normalizedUrl.replace(/\/+$/, '').toLowerCase()
    : `title:${sanitizeString(title, STAR_LINK_LIMITS.title).toLowerCase()}`
  return `${origin}::${keyPart}`
}

// Parse the ingest hash '#/add?s=<encoded>' -> the RAW encoded string, or null.
// We must NOT use URLSearchParams here: it would percent-decode the value once,
// leaving decodeStarPayload to decode a second time. The contract is a single
// encodeURIComponent/decodeURIComponent pair, so we return the value verbatim.
// encodeURIComponent encodes '&', so the payload never contains a raw separator.
export function readIncomingEncoded(hash) {
  if (typeof hash !== 'string' || !hash.startsWith('#/add')) return null
  const queryIndex = hash.indexOf('?')
  if (queryIndex === -1) return null

  for (const pair of hash.slice(queryIndex + 1).split('&')) {
    if (pair.startsWith('s=')) return pair.slice(2)
  }
  return null
}
