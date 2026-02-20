# Tech Stack

This document defines the core technologies and patterns used in the Dorfromantik clone project.

## Core Language & Frameworks
- **Language:** TypeScript
- **Frontend Framework:** React 19
- **Build Tool:** Vite

## Infrastructure & Deployment
- **Platform:** Firebase

## Testing & Quality Assurance
- **Unit & Integration Testing:** Vitest & React Testing Library
- **End-to-End (E2E) Testing:** Playwright
- **Component Development & Docs:** Storybook
- **Code Quality:** ESLint for linting and Putout for automated refactoring and code cleanup.

## Architecture & Rendering
- **Pattern:** Canvas Controller Pattern. This decouples React's lifecycle from the 60fps canvas rendering loop, using a `CanvasController` class to manage game state and specialized renderers.
- **Coordinate System:** Rotated Hexagonal (Flat-Top). North is defined as `(-1, 0, 1)`.

## Styling & UI
- **Styling:** Tailwind CSS for atomic and responsive UI development.
- **Utilities:** `clsx` and `tailwind-merge` for dynamic class management.

## Environment & Infrastructure
- **Development Environment:** Project-specific configuration managed via `.idx/dev.nix`.
- **Package Manager:** npm
