# Services Architecture

This directory contains services that handle external integrations (Firebase, Auth, etc.). These services are designed to be stateless wrappers or singletons that the React context and hooks use.

## Core Services

### AuthService (`src/services/AuthService.ts`)
A wrapper for Firebase Authentication that handles anonymous login, Google Sign-in, and account linking.

- **Mock Mode**: Controlled by the `VITE_USE_MOCK_AUTH` environment variable. When enabled, it bypasses the real Firebase SDK and returns mock user objects. This is critical for stable E2E testing in CI without needing real API keys.
- **State Management**: While it interacts with Firebase's internal state, the primary way the app consumes auth state is via `AuthService.onAuthStateChanged`.
- **Service Interface (Phase 1)**: The auth layer is also modeled via an `IAuthService` interface with `FirebaseAuthService` and `MockAuthService` implementations under `src/services/auth/`, preparing the codebase for React-based dependency injection in later phases.

### FirestoreService (`src/services/FirestoreService.ts`)
Handles persisting and loading game state to/from Firestore.

- **Collection Structure**: `users/{uid}/savedGames/{gameId}` stores `SavedGameDoc` documents wrapping serialized `GameJSON`.
- **Versioning**: Each saved document includes a `version` field (`SAVED_GAME_VERSION`) to support future data migrations.
- **Mock Mode**: Same `VITE_USE_MOCK_AUTH` gate as `AuthService`. Uses an in-memory `Map` store for CI/E2E testing.
- **Integration Points**: `CanvasView` triggers debounced saves (2s) via `CanvasController.onTilePlaced`; `SessionProvider` loads games on auth initialization.

### Firebase (`src/services/firebase.ts`)
The central initialization point for the Firebase JS SDK. It configures Auth and Firestore using environment variables loaded by Vite.

## Testing Strategy
To maintain a high-velocity development cycle and stable CI:

1. **Unit Tests**: Mock the Firebase SDK and services using Vitest's `vi.mock`.
2. **E2E Tests (CI)**: Use the `Mock Auth` mode (`npm run test:e2e:ci`) to verify UI and routing logic in a deterministic, offline environment.
3. **Integration Tests (Local)**: Use real Firebase keys or the Firebase Emulator Suite to verify actual backend integration.
