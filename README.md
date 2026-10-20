# GrenMon

GrenMon is an original browser monster-hunter RPG built around a semi-2D/3D low-poly field-research world. Explore an angled habitat, read conditions, weaken a wild specimen with four limited moves, and capture it when the signal is ready. It deliberately uses original monsters, writing, geometry, and UI rather than proprietary game assets.

## What is playable

- Explore a low-poly Sunwake Meadow with arrow keys, WASD, or the on-screen touch pad on mobile.
- Search the marked grass patches to track original wild specimens; encounters can happen more than once.
- Fight in a fixed-camera 3D arena with one active monster and four move choices.
- Use six type families and field conditions such as Clear air, Silver mist, and Charged soil.
- Weaken the target, then deploy a field capsule to attempt capture.
- Review the captured-monster log; it persists locally in the browser.
- See branching evolution paths in the field notes for Spriggle, Embercub, and Tidefin.

This is the first vertical slice. Saving, inventory, multiple maps, quests, sound, multiplayer, and long-form progression are intentionally out of scope until the research loop is solid.

## Requirements

- Node.js `22.14.0` (the version is pinned in `.nvmrc`)
- npm (bundled with Node.js)

Three.js is the only runtime dependency. The app does not need an API key. `.env.example` is included for future configuration without putting secrets in git.

## Setup

```bash
# Clone the repository and enter it.
git clone https://github.com/RameezHiro/GrenMon.git
cd GrenMon

# Use the version pinned in .nvmrc (Node.js 22.14.0), then install the lockfile exactly.
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

The Vite build bundles the Three.js app into `dist/`. All geometry, data, and UI are local; there is no runtime asset or API request.

## Docker

Build and run the reproducible production image:

```bash
docker build -t grenmon:local .
docker run --rm -p 4173:4173 grenmon:local
```

Then open <http://localhost:4173>. The Dockerfile pins the Node base image, runs `npm ci`, builds the static app, and serves the generated `dist/` directory.

## Exact verification commands

From the repository root, these are the complete clean-machine checks:

```bash
npm ci
npm test
npm run build
npm start
```

For a container-only build and run:

```bash
docker build -t grenmon:local .
docker run --rm -p 4173:4173 grenmon:local
```

## Project shape

```text
index.html          Research shell and game controls
styles.css          Field-guide interface and responsive controls
src/domain.js       Testable monsters, moves, types, conditions, and battle rules
src/game.js         Three.js diorama, fixed arena, input, encounters, and capture flow
test/domain.test.js Offline tests for the game rules
test/server.test.js Port-conflict regression test
vite.config.js      Reproducible Vite configuration
server.mjs          Optional dependency-free static server for built output
PRODUCT.md          Durable product scope and constraints
```

## Design direction

The rebuilt slice is a low-poly field-research diorama: warm paper UI, deep ink silhouettes, citron habitat markers, coral warnings, simple geometric monsters, and a fixed camera that makes the arena readable. Three-dimensional terrain carries depth while the research column keeps decisions and conditions legible.
