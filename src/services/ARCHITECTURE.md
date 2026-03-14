# Services Architecture

This directory contains services that handle external integrations (Firebase, Auth, etc.). These services are designed to be stateless wrappers or singletons that the React context and hooks use.

## Core Services

### AuthService (`src/services/AuthService.ts`)
**Legacy monolithic service** being refactored. Currently a wrapper for Firebase Authentication that handles anonymous login, Google Sign-in, and account linking.

- **Mock Mode**: Controlled by the `VITE_USE_MOCK_AUTH` environment variable. When enabled, it bypasses the real Firebase SDK and returns mock user objects. This is critical for stable E2E testing in CI without needing real API keys.
- **State Management**: While it interacts with Firebase's internal state, the primary way the app consumes auth state is via `AuthService.onAuthStateChanged`.
- **Deprecation**: This service will be replaced by the new DI architecture (Phase 4 cleanup).

### New DI Architecture (Phase 3 consumer migration complete)

#### IAuthService Interface (`src/services/auth/IAuthService.ts`)
Clean interface defining authentication operations without implementation details:
```typescript
export interface IAuthService {
  signInAnonymously(): Promise<string>;
  signInWithGoogle(): Promise<string>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<string | null>;
  onAuthStateChanged(callback: (userId: string | null) => void): () => void;
}
```

#### FirebaseAuthService (`src/services/auth/FirebaseAuthService.ts`)
Production implementation using real Firebase SDK.

#### InMemoryAuthService (`src/services/auth/InMemoryAuthService.ts`)
Lightweight fake implementation for non-Firebase environments (CI/E2E/testing).

**ServiceProvider** (`ServiceProvider.tsx`) wires implementations via React context (from `VITE_USE_MOCK_AUTH` or optional injected instances for tests). **Hooks** `useAuthService()` and `useFirestoreService()` (`hooks/useServices.ts`) are the only way app code should access these services. SessionProvider, UserAccount, CanvasView, and MainMenu all use these hooks.

### FirestoreService (`src/services/FirestoreService.ts`)
**Legacy monolithic service** being refactored. Currently handles persisting and loading game state to/from Firestore.

- **Collection Structure**: `users/{uid}/savedGames/{gameId}` stores `SavedGameDoc` documents wrapping serialized `GameJSON`.
- **Versioning**: Each saved document includes a `version` field (`SAVED_GAME_VERSION`) to support future data migrations.
- **Mock Mode**: Same `VITE_USE_MOCK_AUTH` gate as `AuthService`. Uses an in-memory `Map` store for CI/E2E testing.
- **Integration Points**: `CanvasView` triggers debounced saves (2s) via `CanvasController.onTilePlaced`; `SessionProvider` loads games on auth initialization.
- **Deprecation**: This service will be replaced by the new DI architecture (Phase 4 cleanup).

#### IFirestoreService Interface (`src/services/firestore/IFirestoreService.ts`)
Clean interface defining game state persistence operations:
```typescript
export interface IFirestoreService {
  saveGameState(userId: string, game: Game): Promise<void>;
  loadGameState(userId: string, gameId: string): Promise<Game | null>;
  loadAllGames(userId: string): Promise<Game[]>;
}
```

#### FirebaseFirestoreService (`src/services/firestore/FirebaseFirestoreService.ts`)
Production implementation using real Firebase Firestore SDK.

#### InMemoryFirestoreService (`src/services/firestore/InMemoryFirestoreService.ts`)
Lightweight fake implementation with in-memory `Map<string, Map<string, SavedGameDoc>>` store.

### Firebase (`src/services/firebase.ts`)
The central initialization point for the Firebase JS SDK. It configures Auth and Firestore using environment variables loaded by Vite.

## Testing Strategy
To maintain a high-velocity development cycle and stable CI:

1. **Unit Tests**: Mock the Firebase SDK and services using Vitest's `vi.mock`.
2. **E2E Tests (CI)**: Use the `Mock Auth` mode (`npm run test:e2e:ci`) to verify UI and routing logic in a deterministic, offline environment.
3. **Integration Tests (Local)**: Use real Firebase keys or the Firebase Emulator Suite to verify actual backend integration.
