# Components Architecture

This directory contains reusable UI components that are decoupled from the game's canvas engine. These components follow modern React practices and are visually verified using Storybook.

## 1. Design Philosophy

- **Visual Identity:** All components adhere to the "Cozy & Playful" aesthetic defined in `conductor/product-guidelines.md`. They use a "lifted" glassmorphism look with organic colors (Forest Green, Parchment, Sky Blue).
- **Decoupling:** UI components are "dumb" or "presentational" wherever possible. They receive data via props and communicate user actions via callbacks, ensuring they can be reused across different views (Main Menu, HUD, Settings).
- **Storybook First:** Every component is developed and verified in isolation using Storybook before being integrated into a page. This ensures visual consistency and robust handling of different prop states.
- **Styling:** We use Vanilla CSS with a focus on CSS variables for consistent theming and high-performance transitions/animations.

## 2. Component Directory Structure

```
src/components/
├── GameCard.tsx         # Card representing a saved game or session
├── GameCard.css         # "Lifted" glassmorphism styling for GameCard
├── GameCard.stories.tsx # Storybook visualization for GameCard
├── SettingsModal.tsx    # Modal overlay for game configurations
├── SettingsModal.css    # Blurred overlay and parchment modal styling
├── SettingsModal.stories.tsx # Storybook visualization for SettingsModal
└── ARCHITECTURE.md      # This file
```

## 3. Core Components

### GameCard (`GameCard.tsx`)

A display component used in the Main Menu to list available game sessions.

- **Props:** `id`, `name`, `score`, `lastPlayed`, `onSelect`.
- **Styling:** Uses a `rgba(244, 234, 213, 0.85)` (Parchment) background with a `backdrop-filter: blur(8px)`. It features a "lifted" hover effect using `transform: translateY(-8px)` and deep shadows.
- **Interaction:** Entire card is clickable, triggering the `onSelect` callback.

### SettingsModal (`SettingsModal.tsx`)

An overlay component for adjusting game settings.

- **Props:** `isOpen`, `onClose`.
- **Behavior:**
  - Uses a fixed, blurred overlay to focus attention on the modal.
  - Implements "click-to-close" on the overlay.
  - Stops event propagation on the modal container to prevent accidental closures.
- **Styling:** Follows the Parchment/Forest Green theme with rounded corners (`24px`) and organic spacing.

## 4. Theming and Variables

Components share a common color palette defined via CSS variables within their respective `.css` files:

- `--color-forest-green`: `#2d5a27` (Primary text and buttons)
- `--color-parchment`: `rgba(244, 234, 213, 0.85)` (Main component backgrounds)
- `--color-sky-blue`: `#87ceeb` (Decorative accents and glows)

## 5. Integration Pattern

These components are typically composed within **Pages** (e.g., `src/pages/MainMenu.tsx`).

- **State Management:** The parent page manages the visibility (e.g., `isSettingsOpen`) and data fetching (e.g., list of games from the `Session` model).
- **Navigation:** Buttons within components (like "Continue" in `GameCard`) trigger callbacks that the parent page uses to initiate navigation via `react-router-dom`.

SVG **board** composition (`SvgBoard`) lives under **`src/rendering/svg/board/`**; per-tile primitives (`HexTile`, wedges, segment renderers, `SvgHexUtils`) under **`src/rendering/svg/tiles/`**. Canvas parity uses **`src/rendering/canvas/components/TilePreview.tsx`**. Layout uses `SvgHexUtils.hexToPixel`, delegating to **`src/rendering/common/hex/HexUtils.hexToPixel`** with `SVG_HEX_RADIUS`.
