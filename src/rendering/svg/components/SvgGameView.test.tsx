import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SvgGameView } from './SvgGameView';
import { Game } from '../../../models/Game';
import { GameRules } from '../../../models/GameRules';
import { Board } from '../../../models/Board';
import { Tile } from '../../../models/Tile';

describe('SvgGameView', () => {
  it('renders board shell, SVG surface, and HUD', () => {
    const game = new Game({
      board: new Board(),
      rules: new GameRules(),
      tileQueue: [new Tile()],
      score: 0,
    });

    render(<SvgGameView activeGame={game} setActiveGame={vi.fn()} />);

    expect(screen.getByTestId('game-svg')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
    expect(screen.getByTestId('game-svg').querySelector('svg')).toBeInTheDocument();
  });
});
