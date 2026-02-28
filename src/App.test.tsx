import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders dorfromantik header on main menu', () => {
    render(<App />);
    const headerElement = screen.getByText(/Dorfromantik/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders start game button and navigates to game canvas', async () => {
    render(<App />);
    
    // Check for Start Game button
    const startButton = screen.getByRole('button', { name: /Start Game/i });
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
