# Track: Firebase Auth & Storage Integration

## Phase 1: Core Logic & Serialization (No UI, No DB yet) [checkpoint: 0acf0bf]
- [x] Create and switch to feature branch feat/firebase-integration using **task-conductor** skill.
- [x] Install `firebase` dependency and create a basic `src/services/firebase.ts` initialization file using **task-conductor** skill.
- [x] Implement a `GameSerializer.ts` utility to safely convert a `Game` instance to plain JSON and reconstruct it back into classes using **task-conductor** skill.
- [x] Write exhaustive unit tests for `GameSerializer` to ensure no data is lost during conversion using **task-conductor** skill.
- [x] **Phase Gate**: Verify serialization logic is 100% correct using **project-orchestrator** skill.

## Phase 2: Authentication State [checkpoint: 303856a]
- [x] Implement a standalone `AuthService.ts` wrapper for Firebase anonymous login and Google Sign-In using **task-conductor** skill. (Use Vitest mocks for testing).
- [x] Update `models/User.ts` and `SessionContext.tsx` to automatically sign in anonymously and expose the Firebase UID using **task-conductor** skill.
- [x] Build a "Sign In" UI component (e.g., in `MainMenu` or `SettingsModal`) that calls `AuthService` using **task-conductor** skill.
- [x] **Phase Gate**: Verify UI and Auth state synchronization using **project-orchestrator** skill.

## Phase 2.1: Account Linking & Auth State Robustness [checkpoint: d9d62da]
- [x] Update `AuthService.ts` to use `linkWithPopup` when upgrading an anonymous account to a Google account using **task-conductor** skill.
- [x] Implement a robust `onAuthStateChanged` listener in `SessionContext.tsx` (actually `SessionProvider.tsx`) to handle the initial asynchronous auth loading state using **task-conductor** skill.
- [x] **Phase Gate**: Verify account linking works without data loss and loading state is smooth using **project-orchestrator** skill.

## Phase 2.2: Mock Auth for CI & E2E Tests (Issue #49) [checkpoint: 075d0af]
- [x] Create `.env.ci` with dummy Firebase credentials to prevent CI crashes using **task-conductor** skill.
- [x] Implement Mock Auth mode in `AuthService.ts` when `VITE_USE_MOCK_AUTH=true` using **task-conductor** skill.
- [x] Update `vite.config.ts` and `playwright.config.ts` to support the CI test environment using **task-conductor** skill.
- [x] Update `.github/workflows/ci.yml` to use `VITE_USE_MOCK_AUTH=true` or the new CI testing script using **task-conductor** skill.
- [x] **Phase Gate**: Verify GitHub Actions Playwright E2E tests pass without real keys using **project-orchestrator** skill.

## Phase 2.3: Auth Testing & Coverage
- [x] Fix component tests in `src/components/UserAccount.test.tsx` (remove duplicate `signOut` test and add "Link Google Account" button test) using **task-conductor** skill.
- [x] Implement context tests in `src/context/SessionProvider.test.tsx` to verify `onAuthStateChanged` orchestration and anonymous fallback using **task-conductor** skill.
- [x] Add E2E Playwright tests (`e2e/auth.spec.ts`) utilizing Mock Auth to verify the end-to-end login/logout visual flow using **task-conductor** skill.
- [x] **Phase Gate**: Verify all unit, component, and E2E tests for authentication pass successfully using **project-orchestrator** skill.

## Phase 3: Firestore Integration
- [ ] Define TypeScript interfaces for Firestore documents (`UserProfile` and `SavedGame`) using **task-conductor** skill.
- [ ] Implement `FirestoreService.ts` with methods to `saveGameState` and `loadGameState` using **task-conductor** skill.
- [ ] Implement `firestore.rules` to ensure users can only read/write their own `UserProfile` and `SavedGame` documents using **task-conductor** skill.
- [ ] Add a versioning identifier to the Firestore save payload to support future data migrations using **task-conductor** skill.
- [ ] Integrate `FirestoreService.saveGameState` into the main game loop (debounced after a tile is placed) using **task-conductor** skill.
- [ ] Integrate `FirestoreService.loadGameState` into the initial load sequence if a user returns using **task-conductor** skill.
- [ ] **Final Track Gate**: Final manual verification by user, E2E test update, and Git commit using **project-orchestrator** skill.