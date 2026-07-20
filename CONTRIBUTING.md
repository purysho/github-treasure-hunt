# Contributing to GitHub Treasure Hunt

Thanks for helping people discover open-source projects worth their time.
This project is intentionally small and client-side, so focused contributions
go a long way.

## Quick start

```sh
git clone https://github.com/purysho/github-treasure-hunt.git
cd github-treasure-hunt
npm install
npm run dev
```

## A good first contribution

1. Pick an issue labeled `good first issue`.
2. Leave a brief comment saying you would like to work on it.
3. Create a branch with a short, descriptive name.
4. Keep the pull request focused on that one improvement.
5. Run the checks before opening the pull request:

   ```sh
   npm test
   npm run lint
   npm run build
   ```

## Project guardrails

- Keep the app static and client-side; do not add a backend, database, or
  default API token.
- Do not commit keys, tokens, user data, or generated build output.
- Avoid new dependencies unless they clearly improve the small core experience.
- Preserve keyboard access, visible focus states, and the deliberately calm,
  single-purpose interface.

If you are unsure whether an idea fits, open an issue first. Small bug fixes,
copy improvements, accessibility work, and focused discovery features are all
welcome.
