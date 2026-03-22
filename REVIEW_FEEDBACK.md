# Adversarial Review Feedback - Session Context Refactor

## 🚨 Critical Logic Gaps
* **`src/pages/MainMenu.tsx` (Missing Test Coverage):** The newly refactored orchestration logic (`handleStartStandard`, `handleStartTest`, `handleContinue`) that relies on the `setActiveGame` Context is completely uncovered by unit tests (currently ~48% statement coverage, 40% branch coverage). Since this is the primary entry point for starting a game, it requires rigorous test coverage.
* **`src/services/firestore/InMemoryFirestoreService.ts` (State Bleed):** `mockSavedGames` and `listeners` are declared as global module variables. This will cause shared state across test runs and E2E specs if the environment persists (e.g., during `npm run dev`). These should be moved into the class instance or properly reset between tests via a static method.

## 🐢 Performance Warnings
* **`src/context/SessionProvider.tsx` (Unnecessary Re-renders):** The `games` list (history) is bundled in the same context as `user` and `activeGame`. When a game auto-saves, the Firestore snapshot fires, updating the `games` array and triggering a re-render of ALL `useSession()` consumers—including the `GameBoard`, which does not use the `games` list. This is a potential performance bottleneck for long sessions.

## 🧹 Cleanliness & Standards
* **`src/services/firestore/InMemoryFirestoreService.ts` (Wrong Header):** File header comment says `// src/services/firestore/MockFirestoreService.ts` but the file is `InMemoryFirestoreService.ts`.
* **`src/pages/MainMenu.tsx` (Hook Order):** `useSession()` (Context) is placed after `useState()`. Per project standards, all Context/Services should be grouped at the top.
* **`src/canvas/components/CanvasView.tsx` (Hook Order):** `useRef()` is placed before `useState()`. Grouping should be: Context/Services -> State -> Refs.
* **`src/canvas/engine/CanvasController.ts` (Inconsistent Binding):** `handleResize` is an arrow property, while `handleZoom`, `handleHover`, etc., are regular methods. Use a consistent pattern for input handlers.
* **`src/models/Session.ts` (Ghost Model):** The `Session` model class remains in the codebase and is tested, but it is not utilized by the `SessionProvider`. This creates confusion about whether the "Session" is a class instance or just a collection of context fields.

## 💡 Architectural Alternative
* **Split Contexts:** Decouple `SessionProvider` into `UserProvider` and `GameHistoryProvider`. This would isolate the high-frequency "history sync" updates from the core "active game" rendering loop in `GameBoard`.
* **Centralized Input Logic:** Move `handleResize` and coordinate mapping into a `ViewportManager` class to keep `CanvasController` focused strictly on the render loop and game state orchestration.
