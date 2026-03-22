import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MainMenu } from './MainMenu';
import { UserContext, GameHistoryContext, ActiveGameContext } from '../context/SessionContext';
import { ServiceProvider } from '../services/ServiceProvider';
import { InMemoryAuthService } from '../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../services/firestore/InMemoryFirestoreService';
import { AnonymousUser, RegisteredUser } from '../models/User';
import { Game } from '../models/Game';
import { GameRules } from '../models/GameRules';
import { BrowserRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../components/GameCard', () => ({
  GameCard: ({ id, name, onSelect }: any) => (
    <div data-testid={`game-card-${id}`}>
      <span>{name}</span>
      <button onClick={() => onSelect(id)}>Continue</button>
      <button onClick={() => onSelect('non-existent-id')}>Corrupt</button>
    </div>
  ),
}));

describe('MainMenu', () => {
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();
  const mockSetActiveGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProviders = (user: any, games: Game[] = []) => {
    return render(
      <BrowserRouter>
        <ServiceProvider authService={authService} firestoreService={firestoreService}>
          <UserContext.Provider value={{ user }}>
            <GameHistoryContext.Provider value={{ games }}>
              <ActiveGameContext.Provider
                value={{
                  setActiveGame: mockSetActiveGame,
                }}
              >
                <MainMenu />
              </ActiveGameContext.Provider>
            </GameHistoryContext.Provider>
          </UserContext.Provider>
        </ServiceProvider>
      </BrowserRouter>
    );
  };

  it('renders guest user profile correctly', () => {
    const user = new AnonymousUser('test-anonymous-id-long-enough');
    renderWithProviders(user);

    expect(screen.getByText('Guest')).toBeInTheDocument();
    expect(screen.getByText('test-anonymo')).toBeInTheDocument(); // first 12 chars
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('renders registered user profile correctly and shows logout', () => {
    const user = new RegisteredUser('user-id', 'John Doe');
    renderWithProviders(user);

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles standard game creation and navigation', () => {
    const user = new AnonymousUser('guest');
    renderWithProviders(user);

    fireEvent.click(screen.getByText('Standard Game'));

    expect(mockSetActiveGame).toHaveBeenCalledWith(expect.any(Game));
    const game = mockSetActiveGame.mock.calls[0][0];
    expect(game.rules.initialTurns).toBe(30); // Standard rules
    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });

  it('handles test game creation and navigation', () => {
    const user = new AnonymousUser('guest');
    renderWithProviders(user);

    fireEvent.click(screen.getByText('Test Game'));

    expect(mockSetActiveGame).toHaveBeenCalledWith(expect.any(Game));
    const game = mockSetActiveGame.mock.calls[0][0];
    expect(game.rules.initialTurns).toBe(6); // Test rules
    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });

  it('handles settings modal visibility', () => {
    const user = new AnonymousUser('guest');
    renderWithProviders(user);

    // Should not be visible initially
    expect(screen.queryByText('Profile & Account')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Profile & Account')).toBeInTheDocument();

    // Close the modal
    fireEvent.click(screen.getByText('Back to Menu'));
    expect(screen.queryByText('Profile & Account')).not.toBeInTheDocument();
  });

  it('handles logout', async () => {
    const user = new RegisteredUser('user-id', 'John Doe');
    const signOutSpy = vi.spyOn(authService, 'signOut');
    renderWithProviders(user);

    fireEvent.click(screen.getByText('Logout'));

    expect(signOutSpy).toHaveBeenCalled();
  });

  it('handles continuing a game from the list', () => {
    const user = new AnonymousUser('guest');
    const game = Game.create(GameRules.createStandard());
    
    renderWithProviders(user, [game]);

    fireEvent.click(screen.getByText('Continue'));

    expect(mockSetActiveGame).toHaveBeenCalledWith(game);
    expect(mockNavigate).toHaveBeenCalledWith('/game');
  });

  it('handles logout failure gracefully', async () => {
    const user = new RegisteredUser('user-id', 'John Doe');
    const signOutSpy = vi.spyOn(authService, 'signOut').mockRejectedValue(new Error('Logout failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(user);

    fireEvent.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(signOutSpy).toHaveBeenCalled();
    });
    expect(consoleSpy).toHaveBeenCalledWith("Logout failed", expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('handles missing game on continue gracefully', () => {
    const user = new AnonymousUser('guest');
    const game = Game.create(GameRules.createStandard());
    
    renderWithProviders(user, [game]);

    // Use the Corrupt button from our mock to trigger a non-existent ID
    fireEvent.click(screen.getByText('Corrupt'));

    expect(mockSetActiveGame).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
