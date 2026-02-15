import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders dorfromantik header', () => {
    render(<App />);
    const headerElement = screen.getByText(/Dorfromantik/i);
    expect(headerElement).toBeInTheDocument();
  });

  it('renders the game canvas', () => {
    render(<App />);
    const canvasElement = screen.getByTestId('game-canvas');
    expect(canvasElement).toBeInTheDocument();
    expect(canvasElement).toHaveAttribute('role', 'img');
    expect(canvasElement).toHaveAttribute('aria-label', 'Game Board');
  });
});
