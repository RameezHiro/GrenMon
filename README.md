# GrenMon

GrenMon is an original browser RPG vertical slice inspired by the readable, top-down adventure loops of 1990s creature-collecting games. It deliberately uses original creatures, characters, writing, and pixel-art-inspired Canvas drawings rather than proprietary game assets.

## What is playable

- Explore the hand-authored Sunwake Trail with arrow keys or WASD.
- Walk around blocked tiles and inspect Mara or the trail marker with `Space` or `E`.
- Enter bright grass to trigger an encounter with the original creature Embercub.
- Fight with Spriggle using `Vine Snap`, then return to the trail after victory or defeat.
- Use the mouse on battle buttons or the keyboard shortcuts `1` and `2`.

This is the first vertical slice. Saving, inventory, multiple maps, quests, sound, multiplayer, and creature collection are intentionally out of scope until the core loop is solid.

## Requirements

- Node.js `22.14.0` (the version is pinned in `.nvmrc`)
- npm (bundled with Node.js)

The project has no runtime dependency packages and does not need an API key. `.env.example` is included for future configuration without putting secrets in git.

## Setup

```bash
npm ci
```

`npm ci` uses the committed `package-lock.json` and installs only inside the project. The game itself has no third-party runtime dependencies, so this step is intentionally small.

## Run locally

```bash
npm start
```

Open <http://localhost:4173>. The same command serves the source files during development. If that port is already in use, use the cross-platform alternate-port form:

```bash
npm start -- --port 8080
```

The equivalent environment-variable form is `PORT=8080 npm start` on macOS/Linux or `$env:PORT=8080; npm start` in PowerShell.

## Test

The canonical offline test command exercises the pure movement, interaction, encounter, and battle rules:

```bash
npm test
```

On Unix-like systems, the repository also exposes the same check through Make:

```bash
make test
```

## Production build

```bash
npm run build
node server.mjs --root dist
```

The build copies the self-contained browser app into `dist/`. There is no bundler or remote asset pipeline to make deployment differ from local development.

## Docker

Build and run the reproducible production image:

```bash
docker run --rm -p 4173:4173 grenmon
```

Then open <http://localhost:4173>. The Dockerfile pins the Node base image, runs `npm ci`, builds the static app, and serves the generated `dist/` directory.

## Project shape

```text
index.html          Accessible shell and game controls
styles.css          Risograph-inspired field-guide interface
src/domain.js       Deterministic game rules and authored map data
src/game.js         Canvas renderer, input, dialogue, and battle flow
test/domain.test.js Offline tests for the game rules
scripts/build.mjs   Static production build
server.mjs          Dependency-free local/static server
PRODUCT.md          Durable product scope and constraints
```

## Design direction

The first slice is a risograph field guide: dense ink-black map lines, citron grass, coral registration marks, and paper grain. The map is the primary interaction surface; the right-hand field column explains controls and the active adventure state without hiding the game behind a generic dashboard.
