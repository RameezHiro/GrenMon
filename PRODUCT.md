# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: a Vite-built Three.js browser app with pure JavaScript domain rules. Three.js owns the 2.5D diorama and fixed-camera arena; the domain module remains independent and offline-testable.

## Users

Players who enjoy compact, nostalgic, top-down creature-collecting RPGs in a browser.

## Product Purpose

GrenMon is an original browser monster-hunter RPG. A player reads a habitat, tracks a wild specimen, weakens it with a limited move kit, and captures it when the field conditions are favorable.

## Positioning

The first slice puts a complete research loop in one low-poly habitat with original creatures, branching evolution data, type advantages, field conditions, and a fixed-camera 3D battle arena rather than presenting disconnected demos.

## Operating Context

The game is played in a desktop browser with a keyboard. Arrow keys or WASD move through the angled habitat; number keys 1–4 select moves; Space deploys a capture capsule when the signal is weakened; Escape leaves an encounter. All game data, geometry, and artwork are local to the repository.

## Capabilities and Constraints

- First slice: one angled habitat, movement, tracked encounters, one active monster per side, four moves, six type families, field conditions, weakening, and capture.
- Captured monsters are shown in a local field log and persist through browser refreshes using local storage.
- The habitat encounter pool includes distinct Stone, Gale, and Shade specimens alongside the original Leaf, Ember, and Tide families.
- Battle presentation: a fixed-camera low-poly arena with readable HTML research controls.
- Player identity: a human field researcher is the exploration avatar; monsters are companions and wild specimens, not the player character.
- Monster identity: authored silhouettes, type roles, and branching evolution paths.
- Visual direction: original pixel-art-inspired graphics, creatures, characters, and branding.
- Visual foundation: semi-2D/3D low-poly diorama; no photorealism or external art dependency.
- No Pokémon names, art, sprites, music, or other proprietary assets are used.
- No multiplayer, remote API, account system, shop, quest log, or persistent inventory is in this slice.
- Save files are deliberately deferred until the core loop is stable.

## Brand Commitments

The project name is GrenMon. The world should feel playful, adventurous, and distinctly original rather than copying a specific commercial game's assets or story.

## Evidence on Hand

No external assets or production content were supplied. The initial map, creatures, copy, and vector-like pixel art are authored in the project.

## Product Principles

1. Make the complete loop playable before adding breadth.
2. Keep the game readable at a glance: clear movement, interaction, and battle states.
3. Prefer original, local, reproducible content over borrowed assets or remote services.
4. Keep game rules deterministic and independently testable.

## Accessibility & Inclusion

Keyboard controls are required for the core loop, with visible focus styles and text alternatives for important status and dialogue. High-contrast UI and reduced-motion preferences are supported where practical in the first slice.
