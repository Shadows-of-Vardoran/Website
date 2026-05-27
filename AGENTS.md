# AGENTS.md

## Project

Shadows of Vardoran (SOV) — community website for V Rising. Static site deployed to GitHub Pages.

## Commands

- `yarn dev` — dev server at `http://localhost:5173`
- `yarn build` — production build (static output to `build/`)
- `yarn check` — type-check (`svelte-kit sync && svelte-check`)
- `yarn lint` — **prettier check then eslint** (runs both; fix formatting first with `yarn format`)
- `yarn format` — prettier write

**No test suite exists.**

Always run: `yarn format` → `yarn check` → `yarn lint` after changes.

## Package manager

**Yarn 1.x only.** `engine-strict=true` in `.npmrc` enforces this. Do not use npm or pnpm.

Node 18+ required; CI uses Node 20.

## Stack

- SvelteKit with **Svelte 5** (runes syntax: `$state`, `$derived`, `$effect`, etc.)
- TypeScript (strict mode, `checkJs: true`)
- Tailwind CSS **v4** via `@tailwindcss/vite` plugin (still has a `tailwind.config.ts` for the custom color system)
- Vite 7
- `@sveltejs/adapter-static` with `fallback: '404.html'` for GitHub Pages SPA routing

## Path aliases

- `$lib` → `src/lib`
- `@/*` → `src/lib/*`

## Content system

All content lives in `static/content/` as markdown or JSON — not a database:

- `lore-*.md` — lore pages (parsed with `marked` via `src/lib/useMarked.ts`)
- `rules.md` — rules page
- `guides/*.json` — guides collection
- `.pages.yml` — Decap/Pages CMS config

## Prettier (non-default settings)

- `printWidth: 180` (JSON: `300`)
- `singleQuote: true`
- `trailingComma: 'es5'`
- Plugin: `prettier-plugin-svelte`

## Tailwind color system

`tailwind.config.ts` imports `src/lib/useColors.ts` to generate all color palettes programmatically from base hex values + overlay opacity. Changing colors means editing the constants at the top of `tailwind.config.ts`, not the theme object directly.

## Build/deploy

- CI: `.github/workflows/deploy.yml` — builds on push to `main`, deploys to GitHub Pages
- Build sets `GITHUB_PAGES=true` env var
- `obfuscate-lore.cjs` exists but is **commented out** in CI

## Env vars

- `VITE_DISCORD_CLIENT_ID`
- `VITE_DISCORD_REDIRECT_URI`
- `VITE_BACKEND_URL`
