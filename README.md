# GitHub Treasure Hunt

GitHub Treasure Hunt is a small, static discovery engine for open-source gems.
Search by keyword, narrow the hunt with focused filters, or roll the dice for a
serendipitous repository from GitHub's public search API.

![GitHub Treasure Hunt search and discovery interface](docs/screenshot.png)

## Quick start

```sh
git clone <repository-url> github-treasure-hunt && cd github-treasure-hunt
npm install
npm run dev
```

Node.js 20 or newer is recommended.

## How it works

- Every search, category, star band, and surprise roll uses one canonical
  GitHub repository query.
- Query responses are cached for the session, so one Surprise Me request can
  provide roughly 30 discoveries.
- Filter changes are debounced to protect the unauthenticated GitHub API quota.
- An optional fine-grained, public read-only PAT can be stored in the visitor's
  own browser to raise their personal search limit. It is never sent anywhere
  except directly to GitHub.

This project is deliberately simple: no AI agents, no social network, no
crypto, no accounts, and no analytics. You arrive, discover something cool,
and leave.

## Commands

```sh
npm test
npm run lint
npm run build
```

## Deployment

The repository includes a GitHub Pages workflow for `main`. After pushing the
repository, enable Pages in repository settings and choose **GitHub Actions** as
the source. Vite is configured for the `/github-treasure-hunt/` base path.

## Contributing

Small, focused contributions are welcome. Before opening a pull request:

1. Keep the app static and client-side.
2. Never commit a token, key, credential, or user data.
3. Avoid new dependencies unless the project scope explicitly requires one.
4. Run `npm test`, `npm run lint`, and `npm run build`.

Look for issues labeled `good first issue` or `help wanted` if you would like a
starting point.

## License

[MIT](LICENSE)
