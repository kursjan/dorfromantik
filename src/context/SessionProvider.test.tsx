import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SessionProvider } from './SessionProvider';
import { useSession } from './SessionContext';
import { AuthService } from '../services/AuthService';
import { FirestoreService } from '../services/FirestoreService';
import type { User as FirebaseUser } from 'firebase/auth';

vi.mock('../services/AuthService', () => ({
  AuthService: {
    onAuthStateChanged: vi.fn(),
    signInAnonymously: vi.fn(),
  },
}));

vi.mock('../services/FirestoreService', () => ({
  FirestoreService: {
    loadAllGames: vi.fn(),
  },
}));

const onAuthStateChanged = AuthService.onAuthStateChanged as Mock;
const signInAnonymously = AuthService.signInAnonymously as Mock;
const loadAllGames = FirestoreService.loadAllGames as Mock;

function TestConsumer() {
  const { session } = useSession();
  return (
    <div>
      <span data-testid="user-id">{session.user.id}</span>
      <span data-testid="is-anonymous">{String(session.user.isAnonymous)}</span>
      <span data-testid="session-id">{session.sessionId}</span>
    </div>
  );
}

describe('SessionProvider', () => {
  let capturedCallback: (user: FirebaseUser | null) => void;
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    onAuthStateChanged.mockImplementation((callback: (user: FirebaseUser | null) => void) => {
      capturedCallback = callback;
      return mockUnsubscribe;
    });

    signInAnonymously.mockResolvedValue({
      uid: 'anon-fallback-uid',
      isAnonymous: true,
      displayName: null,
    } as unknown as FirebaseUser);

    loadAllGames.mockResolvedValue([]);
  });

  it('shows loading state before auth resolves', () => {
    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    expect(screen.getByText(/Loading Profile/i)).toBeInTheDocument();
    expect(screen.queryByTestId('user-id')).not.toBeInTheDocument();
  });

  it('calls signInAnonymously when auth fires with null user', () => {
    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => capturedCallback(null));

    expect(signInAnonymously).toHaveBeenCalledOnce();
  });

  it('creates an AnonymousUser session for anonymous firebase user', async () => {
    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => {
      capturedCallback({
        uid: 'anon-123',
        isAnonymous: true,
        displayName: null,
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('anon-123');
    });
    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('true');
    expect(screen.getByTestId('session-id')).toHaveTextContent('session-anon-123');
  });

  it('creates a RegisteredUser session for non-anonymous firebase user', async () => {
    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => {
      capturedCallback({
        uid: 'registered-456',
        isAnonymous: false,
        displayName: 'Jane Doe',
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('registered-456');
    });
    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('false');
    expect(screen.getByTestId('session-id')).toHaveTextContent('session-registered-456');
  });

  it('uses uid as displayName fallback for registered users', async () => {
    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => {
      capturedCallback({
        uid: 'no-name-789',
        isAnonymous: false,
        displayName: null,
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-name-789');
    });
    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('false');
  });

  it('shows error state when signInAnonymously fails and no user arrives', async () => {
    const networkError = new Error('Network error');
    signInAnonymously.mockRejectedValueOnce(networkError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => capturedCallback(null));

    await waitFor(() => {
      expect(screen.getByText(/Initialization Error/i)).toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to sign in anonymously', networkError);
    consoleErrorSpy.mockRestore();
  });

  it('unsubscribes from auth listener on unmount', () => {
    const { unmount } = render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('loads saved games from Firestore on auth', async () => {
    const mockGames = [{ id: 'g1' }, { id: 'g2' }];
    loadAllGames.mockResolvedValueOnce(mockGames);

    function GameCountConsumer() {
      const { session } = useSession();
      return <span data-testid="game-count">{session.games.length}</span>;
    }

    render(
      <SessionProvider>
        <GameCountConsumer />
      </SessionProvider>
    );

    act(() => {
      capturedCallback({
        uid: 'user-with-games',
        isAnonymous: true,
        displayName: null,
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-count')).toHaveTextContent('2');
    });
    expect(loadAllGames).toHaveBeenCalledWith('user-with-games');
  });

  it('creates session with empty games when Firestore load fails', async () => {
    const firestoreError = new Error('Firestore unavailable');
    loadAllGames.mockRejectedValueOnce(firestoreError);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function GameCountConsumer() {
      const { session } = useSession();
      return <span data-testid="game-count">{session.games.length}</span>;
    }

    render(
      <SessionProvider>
        <GameCountConsumer />
      </SessionProvider>
    );

    act(() => {
      capturedCallback({
        uid: 'offline-user',
        isAnonymous: true,
        displayName: null,
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-count')).toHaveTextContent('0');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load saved games', firestoreError);
    consoleErrorSpy.mockRestore();
  });
});
