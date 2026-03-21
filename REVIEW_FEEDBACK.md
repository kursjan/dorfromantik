### 🚨 Critical Logic Gaps
- **Session State Mutation**: In `src/context/SessionProvider.tsx`, the `setActiveGame` method creates a completely new `Session` instance:
  ```typescript
  const setActiveGame = (game: Game) => {
    const newSession = new Session(session.sessionId, session.user, game, [...session.games]);
    setSession(newSession);
  };
  ```
  While this ensures reactivity, the `Session` model itself is a class with mutable arrays (`games`). By spreading `session.games`, we only do a shallow copy. If any logic elsewhere relies on the reference of the `Session` instance (e.g., for identity checks), this frequent recreation could be problematic. However, the bigger issue is that `SessionProvider` state is the *entire* `Session` object. Any change to the active game causes the entire session to be "new", potentially triggering wide re-renders of components that only care about the user or game history.

### 🐢 Performance Warnings
- **Unnecessary Session Recreation**: Every time a game is started or continued, the entire `Session` object is destroyed and recreated in `SessionProvider`. For a "Lean Refactor", we should consider if `activeGame` should be a separate piece of state in the provider, or if the `Session` class should have a `setActiveGame` method that we then use with a forced update/functional update pattern to minimize object allocation.

### 🧹 Cleanliness & Standards
- **Missing JSDoc**: New methods in `src/pages/MainMenu.tsx` (`handleStartStandard`, `handleStartTest`, `handleContinue`) lack JSDoc explaining their orchestration role, as mandated by the `GEMINI.md` maintenance rules.
- **Storybook Duplication**: `src/components/SettingsModal.stories.tsx` contains duplicated mock data initialization for `mockSession` and `permanentSession` which could be centralized.
- **Import Ordering**: In `src/pages/MainMenu.tsx`, the new imports for `Game` and `GameRules` are added at the end of the block, but according to project standards (Context/Services, then Models), they should be grouped more strictly.

### 💡 Architectural Alternative
- **Active Game State**: Instead of wrapping everything in a `Session` class and putting that class in React state, the `SessionProvider` could manage `user`, `games` (history), and `activeGame` as independent states (or a simpler state object). The `Session` class currently acts more like a Data Transfer Object (DTO) in this context; moving the lifecycle logic (starting/ending games) entirely to the `SessionProvider` or the `Game` model factory would truly "lean out" the context.
