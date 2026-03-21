import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';
import { InMemoryAuthService } from './services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from './services/firestore/InMemoryFirestoreService';

describe('App', () => {
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();

  beforeEach(() => {
    authService._resetMockStore();
    firestoreService._resetMockStore();
  });

  it('renders dorfromantik header on main menu', async () => {
    render(<App authService={authService} firestoreService={firestoreService} />);
    const headerElement = await screen.findByText(/Dorfromantik/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders start game button and navigates to game route', async () => {
    render(<App authService={authService} firestoreService={firestoreService} />);

    const startButton = await screen.findByRole('button', { name: /Standard Game/i });
    expect(startButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(startButton);

    // After click we navigate to /game; wait for game route content (canvas or placeholder)
    await waitFor(
      () => {
        const canvas = screen.queryByTestId('game-canvas');
        expect(canvas).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
    const canvasElement = screen.getByTestId('game-canvas');
    expect(canvasElement).toHaveAttribute('role', 'img');
    expect(canvasElement).toHaveAttribute('aria-label', 'Game Board');
  });
});
