# Specification: Main Menu UI and Routing (Issue #32)

## Goal
Implement a dedicated Main Menu screen with routing to manage game sessions, cleanly separating the game canvas from the UI.

## Context
Currently, the application renders the game canvas directly on load. To establish a standard SPA architecture and improve performance, we need to introduce `react-router-dom`. The main menu will serve as the entry point (`/`), displaying saved games, and providing options to start new games. The game itself will be moved to the `/game` route. We will also include a basic Settings modal overlay on the main menu.

## Requirements
1. **Routing:** Use `react-router-dom` to separate `/` (MainMenu) and `/game` (CanvasView).
2. **Testing:** Update existing E2E tests to navigate to `/game` and bypass the menu.
3. **Barebones Verification:** Initially verify that the routing works with an unstyled button.
4. **Visual Design:** Implement the "lifted" glassmorphism look with Forest Green, Parchment, and Sky Blue colors as specified in #32.
5. **Session Management:** Connect the `Session` model to display the list of saved games.
6. **Settings:** Create a placeholder modal overlay for settings on the Main Menu.