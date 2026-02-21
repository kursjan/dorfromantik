import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameHUD } from './GameHUD';

describe('GameHUD', () => {
  it('renders correctly with initial values', () => {
    render(<GameHUD score={0} remainingTurns={30} />);
    
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/Tiles/i)).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders correctly with updated values', () => {
    render(<GameHUD score={1250} remainingTurns={15} />);
    
    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
