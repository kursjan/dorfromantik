# Track: Firebase Auth & Storage Integration

## Phase 1: Core Logic & Serialization (No UI, No DB yet)
- [ ] Create and switch to feature branch `feat/firebase-integration` using **task-conductor** skill.
- [ ] Install `firebase` dependency and create a basic `src/services/firebase.ts` initialization file using **task-conductor** skill.
- [ ] Implement a `GameSerializer.ts` utility to safely convert a `Game` instance to plain JSON and reconstruct it back into classes using **task-conductor** skill.
- [ ] Write exhaustive unit tests for `GameSerializer` to ensure no data is lost during conversion using **task-conductor** skill.
- [ ] **Phase Gate**: Verify serialization logic is 100% correct using **project-orchestrator** skill.

## Phase 2: Authentication State
- [ ] Implement a standalone `AuthService.ts` wrapper for Firebase anonymous login and Google Sign-In using **task-conductor** skill. (Use Vitest mocks for testing).
- [ ] Update `models/User.ts` and `SessionContext.tsx` to automatically sign in anonymously and expose the Firebase UID using **task-conductor** skill.
- [ ] Build a "Sign In" UI component (e.g., in `MainMenu` or `SettingsModal`) that calls `AuthService` using **task-conductor** skill.
- [ ] **Phase Gate**: Verify UI and Auth state synchronization using **project-orchestrator** skill.

## Phase 2.1: Account Linking & Auth State Robustness
- [ ] Update `AuthService.ts` to use `linkWithPopup` when upgrading an anonymous account to a Google account using **task-conductor** skill.
- [ ] Implement a robust `onAuthStateChanged` listener in `SessionContext.tsx` to handle the initial asynchronous auth loading state using **task-conductor** skill.
- [ ] **Phase Gate**: Verify account linking works without data loss and loading state is smooth using **project-orchestrator** skill.

## Phase 3: Firestore Integration
- [ ] Define TypeScript interfaces for Firestore documents (`UserProfile` and `SavedGame`) using **task-conductor** skill.
- [ ] Implement `FirestoreService.ts` with methods to `saveGameState` and `loadGameState` using **task-conductor** skill.
- [ ] Implement `firestore.rules` to ensure users can only read/write their own `UserProfile` and `SavedGame` documents using **task-conductor** skill.
- [ ] Add a versioning identifier to the Firestore save payload to support future data migrations using **task-conductor** skill.
- [ ] Integrate `FirestoreService.saveGameState` into the main game loop (debounced after a tile is placed) using **task-conductor** skill.
- [ ] Integrate `FirestoreService.loadGameState` into the initial load sequence if a user returns using **task-conductor** skill.
- [ ] **Final Track Gate**: Final manual verification by user, E2E test update, and Git commit using **project-orchestrator** skill.