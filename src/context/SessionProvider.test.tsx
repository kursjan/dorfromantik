import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SessionProvider } from './SessionProvider';
import { useSession } from './SessionContext';
import { AuthService } from '../services/AuthService';
import type { User as FirebaseUser } from 'firebase/auth';

vi.mock('../services/AuthService', () => ({
  AuthService: {
    onAuthStateChanged: vi.fn(),
    signInAnonymously: vi.fn(),
  },
}));

const onAuthStateChanged = AuthService.onAuthStateChanged as Mock;
const signInAnonymously = AuthService.signInAnonymously as Mock;

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
    signInAnonymously.mockRejectedValueOnce(new Error('Network error'));

    render(
      <SessionProvider>
        <TestConsumer />
      </SessionProvider>
    );

    act(() => capturedCallback(null));

    await waitFor(() => {
      expect(screen.getByText(/Initialization Error/i)).toBeInTheDocument();
    });
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

  it('populates session with demo games', async () => {
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
        uid: 'demo-user',
        isAnonymous: true,
        displayName: null,
      } as unknown as FirebaseUser);
    });

    await waitFor(() => {
      expect(screen.getByTestId('game-count')).toHaveTextContent('2');
    });
  });
});
