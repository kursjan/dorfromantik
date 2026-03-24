# Services Architecture

This directory contains services for external integrations (Firebase Auth, Firestore). Access is **only** via React context: `ServiceProvider` provides implementations, and components use `useAuthService()` and `useFirestoreService()` from `hooks/useServices.ts`. There are no static service singletons.

## Structure

### Auth

#### IAuthService (`src/services/auth/IAuthService.ts`)
Interface for authentication. Callbacks and return values use the `AuthUser` DTO (not Firebase types):

```typescript
export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
}

export interface IAuthService {
  signInAnonymously(): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
```

- **FirebaseAuthService** (`auth/FirebaseAuthService.ts`): Production implementation using the Firebase Auth SDK.
- **InMemoryAuthService** (`auth/InMemoryAuthService.ts`): In-memory implementation for tests and CI/E2E (`VITE_USE_MOCK_AUTH`).

### Firestore (game persistence)

#### IFirestoreService (`src/services/firestore/IFirestoreService.ts`)

```typescript
export interface IFirestoreService {
  saveGameState(userId: string, game: Game): Promise<void>;
  loadGameState(userId: string, gameId: string): Promise<Game | null>;
  loadAllGames(userId: string): Promise<Game[]>;
}
```

- **FirebaseFirestoreService** (`firestore/FirebaseFirestoreService.ts`): Production implementation; stores `SavedGameDoc` at `users/{uid}/savedGames/{gameId}` with `SAVED_GAME_VERSION`.
- **InMemoryFirestoreService** (`firestore/InMemoryFirestoreService.ts`): In-memory `Map` store for tests and CI/E2E.

### Wiring

- **ServiceProvider** (`ServiceProvider.tsx`): Renders `ServiceContext.Provider`. Uses `VITE_USE_MOCK_AUTH` to choose Firebase vs in-memory implementations, or accepts optional `authService` / `firestoreService` props for tests.
- **Hooks** (`hooks/useServices.ts`): `useAuthService()` and `useFirestoreService()`; throw if used outside `ServiceProvider`.

Consumers (e.g. `SessionProvider`, `UserAccount`, `CanvasView`, `MainMenu`) use these hooks only.

### Firebase init

- **firebase.ts**: Initializes the Firebase JS SDK (Auth and Firestore) from Vite env.

## Testing

- **Unit / component tests**: Use `ServiceProvider` with `InMemoryAuthService` and `InMemoryFirestoreService` (injected via `App` or wrapper), or mock `useAuthService` / `useFirestoreService` where needed.
- **E2E (CI)**: `npm run test:e2e:ci` runs with mock auth (in-memory services) for deterministic, offline checks.
- **Local integration**: Real Firebase or emulator when not using `VITE_USE_MOCK_AUTH`.
