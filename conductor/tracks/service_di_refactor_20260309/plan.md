# Track: Service DI Refactor

**Issue:** #50
**Branch:** `worker1`
**Goal:** Replace `if (isMockAuth)` branches in `AuthService` and `FirestoreService` with proper React DI — separate interface + real/mock implementations, wired via a `ServiceProvider` context.

---

## Phase 1: Auth Service — Interface & Implementations

- [x] 1.1 Create `IAuthService` interface in `src/services/auth/IAuthService.ts`.
- [x] 1.2 Create `FirebaseAuthService` implementing `IAuthService` in `src/services/auth/FirebaseAuthService.ts` (real Firebase logic, no mock branches).
- [x] 1.3 Create `MockAuthService` implementing `IAuthService` in `src/services/auth/MockAuthService.ts` (in-memory mock logic).
- [x] 1.4 Add/adapt unit tests for `MockAuthService` and `FirebaseAuthService` in `src/services/auth/`.
- [x] **Phase Gate** using **project-orchestrator** skill.

## Phase 2: Firestore Service — Interface & Implementations

- [ ] 2.1 Create `IFirestoreService` interface in `src/services/firestore/IFirestoreService.ts`.
- [ ] 2.2 Create `FirebaseFirestoreService` implementing `IFirestoreService` in `src/services/firestore/FirebaseFirestoreService.ts`.
- [ ] 2.3 Create `MockFirestoreService` implementing `IFirestoreService` in `src/services/firestore/MockFirestoreService.ts` (with `_resetMockStore`).
- [ ] 2.4 Move `firestore-types.ts` into `src/services/firestore/` subdirectory.
- [ ] 2.5 Add/adapt unit tests for `MockFirestoreService` and `FirebaseFirestoreService` in `src/services/firestore/`.
- [ ] **Phase Gate** using **project-orchestrator** skill.

## Phase 3: React Context Wiring & Consumer Migration

- [ ] 3.1 Create `ServiceProvider` context in `src/services/ServiceProvider.tsx` — reads `VITE_USE_MOCK_AUTH`, instantiates real or mock services, exposes `useAuthService()` and `useFirestoreService()` hooks.
- [ ] 3.2 Wire `ServiceProvider` into `App.tsx` (wrap app tree).
- [ ] 3.3 Migrate `SessionProvider` — replace static `AuthService` / `FirestoreService` calls with context hooks.
- [ ] 3.4 Migrate `UserAccount` — replace static `AuthService` calls with `useAuthService()`.
- [ ] 3.5 Migrate `CanvasView` — replace static `FirestoreService` calls with `useFirestoreService()`.
- [ ] 3.6 Migrate `MainMenu` — if it references services directly.
- [ ] **Phase Gate** using **project-orchestrator** skill.

## Phase 4: Cleanup & Final Verification

- [ ] 4.1 Delete old monolithic `src/services/AuthService.ts` and `src/services/FirestoreService.ts`.
- [ ] 4.2 Update all test files that mock the old static services to use the new DI pattern.
- [ ] 4.3 Update `src/services/ARCHITECTURE.md` to reflect the new structure.
- [ ] 4.4 Full verification: `npm run typecheck`, `npm run test:unit`, `npm run test:e2e:ci`.
- [ ] **Final Track Gate** using **project-orchestrator** skill.
