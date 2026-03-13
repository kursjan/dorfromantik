import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { SessionProvider } from './SessionProvider';
import { useSession } from './SessionContext';
import { ServiceProvider } from '../services/ServiceProvider';
import { useAuthService } from '../services/hooks/useServices';
import { useFirestoreService } from '../services/hooks/useServices';
import React from 'react';

// Mock the service hooks
vi.mock('../services/hooks/useServices', () => ({
  useAuthService: vi.fn(),
  useFirestoreService: vi.fn(),
}));

const mockAuthService = {
  onAuthStateChanged: vi.fn(),
  signInAnonymously: vi.fn(),
};

const mockFirestoreService = {
  loadAllGames: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  (useAuthService as Mock).mockReturnValue(mockAuthService);
  (useFirestoreService as Mock).mockReturnValue(mockFirestoreService);
});

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
  let capturedCallback: (userId: string | null) => void;
  const mockUnsubscribe = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock services
    mockAuthService.onAuthStateChanged.mockImplementation((callback: (userId: string | null) => void) => {
      capturedCallback = callback;
      return mockUnsubscribe;
    });

    mockAuthService.signInAnonymously.mockResolvedValue('anon-fallback-uid');
    mockFirestoreService.loadAllGames.mockResolvedValue([]);
  });

  function renderWithProviders(children: React.ReactNode) {
    return render(
      <ServiceProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </ServiceProvider>
    );
  }

  it('shows loading state before auth resolves', () => {
    renderWithProviders(<TestConsumer />);

    expect(screen.getByText(/Loading Profile/i)).toBeInTheDocument();
    expect(screen.queryByTestId('user-id')).not.toBeInTheDocument();
  });

  it('calls signInAnonymously when auth fires with null user', async () => {
    renderWithProviders(<TestConsumer />);

    await act(async () => {
      capturedCallback(null);
    });

    expect(mockAuthService.signInAnonymously).toHaveBeenCalledOnce();
  });

  it('creates session when signInAnonymously succeeds', async () => {
    renderWithProviders(<TestConsumer />);

    act(() => capturedCallback(null));

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('anon-fallback-uid');
    });
    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('true');
    expect(screen.getByTestId('session-id')).toHaveTextContent('session-anon-fallback-uid');
  });

  it('creates session for existing user', async () => {
    renderWithProviders(<TestConsumer />);

    act(() => capturedCallback('existing-user-123'));

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('existing-user-123');
    });
    expect(screen.getByTestId('is-anonymous')).toHaveTextContent('true');
    expect(screen.getByTestId('session-id')).toHaveTextContent('session-existing-user-123');
  });

  it('shows error state when signInAnonymously fails and no user arrives', async () => {
    mockAuthService.signInAnonymously.mockRejectedValueOnce(new Error('Network error'));

    function ErrorConsumer() {
      const { session } = useSession();
      return <span data-testid="has-session">{session ? 'yes' : 'no'}</span>;
    }

    renderWithProviders(<ErrorConsumer />);

    act(() => capturedCallback(null));

    await waitFor(() => {
      expect(screen.getByText(/Initialization Error/i)).toBeInTheDocument();
      // When there's an error, the SessionProvider doesn't render children
      expect(screen.queryByTestId('has-session')).not.toBeInTheDocument();
    });
  });

  it('unsubscribes from auth listener on unmount', () => {
    const { unmount } = renderWithProviders(<TestConsumer />);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('loads saved games from Firestore on auth', async () => {
    const mockGames = [{ id: 'g1' }, { id: 'g2' }];
    mockFirestoreService.loadAllGames.mockResolvedValueOnce(mockGames);

    function GameCountConsumer() {
      const { session } = useSession();
      return <span data-testid="game-count">{session.games.length}</span>;
    }

    renderWithProviders(<GameCountConsumer />);

    act(() => capturedCallback('user-with-games'));

    await waitFor(() => {
      expect(screen.getByTestId('game-count')).toHaveTextContent('2');
    });
    expect(mockFirestoreService.loadAllGames).toHaveBeenCalledWith('user-with-games');
  });

  it('creates session with empty games when Firestore load fails', async () => {
    mockFirestoreService.loadAllGames.mockRejectedValueOnce(new Error('Firestore unavailable'));

    function GameCountConsumer() {
      const { session } = useSession();
      return <span data-testid="game-count">{session.games.length}</span>;
    }

    renderWithProviders(<GameCountConsumer />);

    act(() => capturedCallback('offline-user'));

    await waitFor(() => {
      expect(screen.getByTestId('game-count')).toHaveTextContent('0');
    });
  });
});
