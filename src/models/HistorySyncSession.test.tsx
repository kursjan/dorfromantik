import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

import { SessionProvider } from '../context/SessionProvider';
import { useSession } from '../context/SessionContext';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';
import { Game } from './Game';
import { GameRules } from './GameRules';

// Minimal Main Menu Mock
const MockMainMenu = () => {
  const { games, setActiveGame } = useSession();
  const navigate = useNavigate();

  const handleStartGame = () => {
    const newGame = Game.create(GameRules.createTest());
    setActiveGame(newGame);
    navigate('/game');
  };

  return (
    <div>
      <h1>Main Menu</h1>
      <button onClick={handleStartGame}>Start Test Game</button>
      <div data-testid="games-list">
        {games.map(g => (
          <div key={g.id} data-testid="game-item">{g.id}</div>
        ))}
      </div>
    </div>
  );
};

// Minimal Game Board Mock with manual Save simulation
const MockGameBoard = ({ firestoreService }: { firestoreService: InMemoryFirestoreService }) => {
  const { user, activeGame } = useSession();
  const navigate = useNavigate();

  const handleSimulateSave = async () => {
    if (activeGame) {
      await firestoreService.saveGameState(user.id, activeGame);
    }
  };

  return (
    <div>
      <h1>Game Board</h1>
      <button onClick={handleSimulateSave}>Simulate Save</button>
      <button onClick={() => navigate('/')}>Back to Menu</button>
    </div>
  );
};

// Mock App Router
const MockApp = ({ firestoreService }: { firestoreService: InMemoryFirestoreService }) => {
  const [currentPath, setCurrentPath] = useState('/');

  // A very simple custom router instead of React Router to isolate the test
  const navigate = (path: string) => setCurrentPath(path);

  return (
    <MemoryRouter>
      <MockRouterContext.Provider value={{ navigate, currentPath }}>
        {currentPath === '/' ? <MockMainMenu /> : <MockGameBoard firestoreService={firestoreService} />}
      </MockRouterContext.Provider>
    </MemoryRouter>
  );
};

// Context to mock routing internally for the test components
const MockRouterContext = React.createContext<{ navigate: (path: string) => void, currentPath: string }>({ navigate: () => {}, currentPath: '/' });

// Override useNavigate to use our mock context
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => {
      const { navigate } = React.useContext(MockRouterContext);
      return navigate;
    },
  };
});


describe('History Sync Integration', () => {
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();

  beforeEach(() => {
    authService._resetMockStore();
    firestoreService._resetMockStore();
    vi.clearAllMocks();
  });

  it('updates the Main Menu Continue Journey list in real-time after a game is saved', async () => {
    const user = userEvent.setup();

    render(
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        <SessionProvider>
          <MockApp firestoreService={firestoreService} />
        </SessionProvider>
      </ServiceProvider>
    );

    // 1. Wait for Auth to initialize and verify Main Menu is empty
    await waitFor(() => {
      expect(screen.getByText('Main Menu')).toBeInTheDocument();
    });
    expect(screen.queryAllByTestId('game-item')).toHaveLength(0);

    // 2. Start a Game
    const startButton = screen.getByRole('button', { name: /Start Test Game/i });
    await user.click(startButton);

    // 3. Verify we are on the Game Board
    await waitFor(() => {
      expect(screen.getByText('Game Board')).toBeInTheDocument();
    });

    // 4. Simulate the Autosaver saving the game to Firestore
    const saveButton = screen.getByRole('button', { name: /Simulate Save/i });
    await user.click(saveButton);

    // Give Firestore service a tick to notify listeners
    await new Promise(resolve => setTimeout(resolve, 0));

    // 5. Navigate Back to Menu
    const backButton = screen.getByRole('button', { name: /Back to Menu/i });
    await user.click(backButton);

    // 6. Verify Main Menu now shows the newly saved game automatically
    await waitFor(() => {
      expect(screen.getByText('Main Menu')).toBeInTheDocument();
    });

    // The Continue Journey list should now have 1 item, proving the real-time sync worked
    // across route changes without a hard refresh.
    await waitFor(() => {
      expect(screen.queryAllByTestId('game-item')).toHaveLength(1);
    });
  });
});
