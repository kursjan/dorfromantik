import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the service hooks
vi.mock('./services/hooks/useServices', () => ({
  useAuthService: vi.fn(() => ({
    signInAnonymously: vi.fn().mockResolvedValue('mock-uid'),
    signInWithGoogle: vi.fn().mockResolvedValue('mock-uid'),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentUser: vi.fn().mockResolvedValue('mock-uid'),
    onAuthStateChanged: vi.fn((callback) => {
      // Immediately call callback with user id
      callback('mock-uid');
      return vi.fn();
    }),
  })),
  useFirestoreService: vi.fn(() => ({
    loadAllGames: vi.fn().mockResolvedValue([]),
    saveGameState: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('App', () => {
  it('renders dorfromantik header on main menu', async () => {
    render(<App />);
    const headerElement = await screen.findByText(/Dorfromantik/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders start game button and navigates to game canvas', async () => {
    render(<App />);
    
    const startButton = await screen.findByRole('button', { name: /Standard Game/i });
    expect(startButton).toBeInTheDocument();
    
    // Click the button to navigate
    const user = userEvent.setup();
    await user.click(startButton);
    
    // Verify we are now on the GameBoard which has the canvas
    const canvasElement = await screen.findByTestId('game-canvas');
    expect(canvasElement).toBeInTheDocument();
    expect(canvasElement).toHaveAttribute('role', 'img');
    expect(canvasElement).toHaveAttribute('aria-label', 'Game Board');
  });
});
