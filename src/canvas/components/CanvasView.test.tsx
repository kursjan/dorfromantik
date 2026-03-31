import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Board } from '../../models/Board';
import { Game } from '../../models/Game';
import { Tile } from '../../models/Tile';
import { GameRules } from '../../models/GameRules';
import { CanvasController } from '../engine/CanvasController';
import { CanvasView } from './CanvasView';

vi.mock('../engine/CanvasController', () => {
  const mockSnapshot = {
    fps: 0,
    camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
    hoveredHex: null,
  };
  const MockController = vi.fn();
  MockController.prototype.destroy = vi.fn();
  MockController.prototype.resetCamera = vi.fn();
  MockController.prototype.subscribeDebug = vi.fn(() => vi.fn());
  MockController.prototype.getDebugSnapshot = vi.fn(() => mockSnapshot);
  return {
    CanvasController: MockController,
  };
});

describe('CanvasView', () => {
  let game: Game;

  beforeEach(() => {
    const board = new Board();
    const rules = new GameRules();
    game = new Game({ board, rules, tileQueue: [new Tile(), new Tile()], score: 100 });
    vi.clearAllMocks();
  });

  it('renders correctly with HUD and Canvas', () => {
    render(<CanvasView activeGame={game} setActiveGame={vi.fn()} />);

    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Tiles/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
  });

  it('initializes CanvasController on mount', () => {
    render(<CanvasView activeGame={game} setActiveGame={vi.fn()} />);

    expect(CanvasController).toHaveBeenCalled();
  });

  it('cleans up CanvasController on unmount', () => {
    const { unmount } = render(<CanvasView activeGame={game} setActiveGame={vi.fn()} />);

    const controllerInstance = vi.mocked(CanvasController).mock.results[0].value;
    unmount();

    expect(controllerInstance.destroy).toHaveBeenCalled();
  });
});
