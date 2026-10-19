---
name: GrenMon
description: An original pocket adventure printed like a living field guide.
colors:
  ink: "#152f2c"
  ink-soft: "#3b5751"
  paper: "#f3e7c7"
  paper-light: "#fff6dc"
  paper-deep: "#e7d4a6"
  coral: "#ef7258"
  citron: "#c9dc57"
  blue: "#416f9f"
typography:
  display:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "clamp(2.3rem, 5vw, 4.4rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.4
  label:
    fontFamily: "Trebuchet MS, Segoe UI, sans-serif"
    fontSize: "0.67rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.14em"
rounded:
  none: "0"
spacing:
  xs: "8px"
  sm: "12px"
  md: "18px"
  lg: "26px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-light}"
    rounded: "{rounded.none}"
    padding: "9px 12px"
  button-primary-hover:
    backgroundColor: "#244b45"
    textColor: "{colors.paper-light}"
    rounded: "{rounded.none}"
    padding: "9px 12px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "9px 12px"
  field-card:
    backgroundColor: "{colors.paper-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "18px"
---

# Design System: GrenMon

## Overview

**Creative North Star: "The Living Field Guide"**

GrenMon treats the game screen as a printed route plate: the map is the artifact, the player makes marks through it, and the surrounding copy behaves like an annotated research note. The visual language borrows the physical discipline of a two- or three-ink print run—ink-black structure, paper warmth, citron discoveries, coral registration marks—without borrowing any commercial game's characters or assets.

The layout is deliberately dense but not cramped. The playable map owns the first viewport; the field column carries status, controls, and the current log. Canvas rendering keeps the world tactile and pixel-led, while the surrounding HTML remains readable and keyboard-first.

**Key Characteristics:**
- Print-plate framing around the playable map.
- Square borders and registration offsets used as structural marks, not decoration.
- Original creatures rendered from local pixel shapes.
- One authored action moment: the calm exploration plate flips into a battle specimen plate.

## Colors

The palette is a full four-role print palette: warm paper for the page, deep ink for structure, citron for discoveries, and coral for urgency and annotation.

### Primary
- **Deep route ink** (`#152f2c`): Map walls, type, borders, and the primary battle action.

### Secondary
- **Registration coral** (`#ef7258`): Active labels, creature accents, encounter urgency, and registration ticks.
- **Field citron** (`#c9dc57`): Tall grass, health state, and the visual signal for something worth exploring.

### Tertiary
- **Chart blue** (`#416f9f`): Player clothing and companion identity; used sparingly so the world stays print-led.

### Neutral
- **Route paper** (`#f3e7c7`): Page ground and the default ambient field.
- **Plate paper** (`#fff6dc`): Readable containers, map footer, dialogue, and battle cards.
- **Paper shadow** (`#e7d4a6`): Secondary surfaces and map tiles.
- **Soft ink** (`#3b5751`): Supporting labels and quieter status copy.

### Named Rules
**The Registration Rule.** Coral and citron marks should explain a state, a discovery, or a physical print layer; never scatter them as generic decoration.

## Typography

**Display Font:** Georgia (with Times New Roman, serif)
**Body Font:** Trebuchet MS (with Segoe UI, sans-serif)
**Label Font:** Trebuchet MS in tracked uppercase

**Character:** The display voice is literary and map-like; the body voice is sturdy and legible for controls and status copy. The contrast makes the game feel authored without sacrificing quick scanning.

### Hierarchy
- **Display** (800, `clamp(2.3rem, 5vw, 4.4rem)`, 0.9): Product and route title.
- **Headline** (800, 1.35rem, 1): Field section titles.
- **Body** (700, 1rem, 1.4): Dialogue and current-entry copy.
- **Label** (900, 0.67rem, `0.14em`, uppercase): Plate labels, controls, status, and metadata.

### Named Rules
**The Two-Voice Rule.** Use the serif display voice for place, creature, and section names; use the sans label voice for controls, measurements, and state.

## Layout

The desktop composition is a two-column plate: a large map surface at left and a narrow field column at right. The page shell is capped at 1320px with a 26px working gap. The canvas owns the map interaction; HTML controls sit beside it instead of overlaying it.

Below 930px the field column becomes a two-column note grid. Below 580px it linearizes into one column and the canvas scales to the available width without changing its internal pixel coordinate system. The map maintains a 20 × 14 tile grid.

## Elevation & Depth

Depth is primarily tonal and typographic: ink walls, paper plates, and the coral encounter card create the hierarchy. The outer game plate uses a structural offset shadow (`12px 14px 0 rgba(21, 47, 44, 0.12)`) like a sheet slightly misregistered on a print bed. Controls lift by 2px on hover; there are no glossy gradients or glass surfaces.

### Named Rules
**The Flat Plate Rule.** Keep map and note surfaces flat at rest. Use the registration offset only to show the game plate's physical relationship to the page.

## Shapes

The system is square and clipped: 0px radii, 1–3px ink borders, and pixel-shaped marks. Corners are not softened because the interface is meant to feel printed, measured, and hand-aligned rather than like a generic rounded dashboard.

## Components

### Buttons
- **Shape:** Square, ink-bordered (`0px` radius).
- **Primary:** Deep ink background, plate-paper text, 9px × 12px padding, bold action label.
- **Hover / Focus:** Citron hover surface with a small -2px translation; coral focus ring with a 4px offset.
- **Secondary:** Transparent paper surface with an ink border; coral shortcut label.

### Cards / Containers
- **Corner Style:** Square, ink border.
- **Background:** Plate paper for readable content; paper-deep for secondary notes; coral for the current-entry card.
- **Shadow Strategy:** The outer game plate uses the structural print offset; internal cards stay flat.
- **Internal Padding:** 17–20px for notes, 18px for the game plate, 14–16px for dialogue.

### Signature Component: Route Plate
The route plate is a bordered canvas with a tiny metadata header, hand-authored tile map, and live position footer. It is the primary interaction surface and the visual anchor of the product.

### Signature Component: Battle Specimen
The battle state reuses the same plate but changes the canvas field, creature scale, specimen cards, and recent-log panel. The mode change is explicit in both canvas lettering and the HTML status column.

## Do's and Don'ts

### Do:
- **Do** keep the map as the first and largest interaction surface.
- **Do** use original local shapes for characters and creatures.
- **Do** make keyboard actions visible in labels and keep focus rings clear.
- **Do** let coral and citron explain state or discovery.
- **Do** preserve the paper/ink contrast at mobile widths.

### Don't:
- **Don't** add commercial creature names, copied sprites, or remote asset URLs.
- **Don't** replace the route plate with a generic card dashboard.
- **Don't** soften the system with pill-shaped controls or decorative glass.
- **Don't** use color alone to communicate battle state; pair it with labels and live text.
