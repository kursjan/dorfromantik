import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameBoard } from './GameBoard';
import { SessionContext } from '../context/SessionContext';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';
import { Session } from '../models/Session';
import { AnonymousUser } from '../models/User';
import { Game } from '../models/Game';
import { Board } from '../models/Board';
import { GameRules } from '../models/GameRules';
import { Tile } from '../models/Tile';
import { GameAutosaver } from '../canvas/services/GameAutosaver';

vi.mock('../canvas/services/GameAutosaver', () => {
  return {
    GameAutosaver: vi.fn().mockImplementation(function(this: any) {
      this.handleTilePlaced = vi.fn();
      this.dispose = vi.fn();
    }),
  };
});

// Mock CanvasView to avoid WebGL/CanvasController overhead in these tests
vi.mock('../canvas/components/CanvasView', () => ({
  CanvasView: ({ onTilePlaced }: { onTilePlaced: () => void }) => (
    <div data-testid="mock-canvas-view">
      <button data-testid="trigger-tile-placed" onClick={onTilePlaced}>
        Place Tile
      </button>
    </div>
  ),
}));

describe('GameBoard', () => {
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();
  let user: AnonymousUser;

  beforeEach(() => {
    user = new AnonymousUser('test-user');
    vi.clearAllMocks();
  });

  function renderWithProviders(session: Session) {
    return render(
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        <SessionContext.Provider
          value={{
            session,
            startNewStandardGame: vi.fn(),
            startNewTestGame: vi.fn(),
            continueGame: vi.fn(),
          }}
        >
          <GameBoard />
        </SessionContext.Provider>
      </ServiceProvider>
    );
  }

  it('renders "No active game session" when there is no active game', () => {
    const session = new Session('test-session', user); // No active game

    renderWithProviders(session);

    expect(screen.getByText(/No active game session/i)).toBeInTheDocument();
    expect(screen.getByText(/Please return to the main menu/i)).toBeInTheDocument();
    expect(screen.queryByTestId('mock-canvas-view')).not.toBeInTheDocument();
  });

  it('renders CanvasView when there is an active game', () => {
    const game = new Game({
      board: new Board(),
      rules: new GameRules(),
      tileQueue: [new Tile()],
      score: 0,
    });
    const session = new Session('test-session', user, game);

    renderWithProviders(session);

    expect(screen.getByTestId('mock-canvas-view')).toBeInTheDocument();
    expect(screen.queryByText(/No active game session/i)).not.toBeInTheDocument();
  });

  it('initializes GameAutosaver and delegates tile placement', async () => {
    const game = new Game({
      board: new Board(),
      rules: new GameRules(),
      tileQueue: [new Tile()],
      score: 0,
    });
    const session = new Session('test-session', user, game);

    renderWithProviders(session);

    // Verify autosaver was instantiated
    expect(GameAutosaver).toHaveBeenCalledTimes(1);

    // Get the mock instance
    const autosaverMockInstance = vi.mocked(GameAutosaver).mock.results[0].value;

    // Simulate placing a tile via the mock CanvasView
    const placeTileButton = screen.getByTestId('trigger-tile-placed');
    placeTileButton.click();

    // Verify the debounced save method was called on the autosaver
    await waitFor(() => {
      expect(autosaverMockInstance.handleTilePlaced).toHaveBeenCalledTimes(1);
    });
  });

  it('cleans up GameAutosaver on unmount', () => {
    const game = new Game({
      board: new Board(),
      rules: new GameRules(),
      tileQueue: [new Tile()],
      score: 0,
    });
    const session = new Session('test-session', user, game);

    const { unmount } = renderWithProviders(session);

    const autosaverMockInstance = vi.mocked(GameAutosaver).mock.results[0].value;
    unmount();

    // Verify dispose was called
    expect(autosaverMockInstance.dispose).toHaveBeenCalledTimes(1);
  });
});
