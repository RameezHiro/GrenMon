# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: a dependency-light HTML/CSS/JavaScript Canvas app served by Node.js. This keeps the first slice portable, offline-testable, and easy to rebuild on a clean machine.

## Users

Players who enjoy compact, nostalgic, top-down creature-collecting RPGs in a browser.

## Product Purpose

GrenMon is an original browser RPG vertical slice. A player explores a small route, talks to a local character, discovers a creature encounter in tall grass, and completes a short turn-based battle.

## Positioning

The first slice puts a complete adventure loop in one small map with original creatures and a hand-authored retro interface, rather than presenting disconnected demos or relying on external art and services.

## Operating Context

The game is played in a desktop browser with a keyboard. Arrow keys or WASD move the player; Space or E interacts; battle choices are selected with the mouse or keyboard. All game data and artwork are local to the repository.

## Capabilities and Constraints

- First slice: one town/route map, movement, collision, one NPC interaction, tall-grass encounters, and one turn-based battle.
- Visual direction: original pixel-art-inspired graphics, creatures, characters, and branding.
- No Pokémon names, art, sprites, music, or other proprietary assets are used.
- No multiplayer, remote API, account system, shop, quest log, or inventory is in this slice.
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
