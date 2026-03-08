import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Board } from '../../models/Board';
import { Game } from '../../models/Game';
import { Tile } from '../../models/Tile';
import { GameRules } from '../../models/GameRules';
import { Session } from '../../models/Session';
import { AnonymousUser } from '../../models/User';
import { CanvasController } from '../engine/CanvasController';
import { CanvasView } from './CanvasView';

// Mock CanvasController
vi.mock('../engine/CanvasController', () => {
  const MockController = vi.fn();
  MockController.prototype.destroy = vi.fn();
  MockController.prototype.resetCamera = vi.fn();
  MockController.prototype.addDebugStatsListener = vi.fn(() => vi.fn());
  return {
    CanvasController: MockController,
  };
});

describe('CanvasView', () => {
  let session: Session;
  let game: Game;

  beforeEach(() => {
    const user = new AnonymousUser('test-user');
    const board = new Board();
    const rules = new GameRules();
    game = new Game({ board, rules, tileQueue: [new Tile(), new Tile()], score: 100 });
    session = new Session('test-session', user, game);
    vi.clearAllMocks();
  });

  it('renders correctly with HUD and Canvas', () => {
    render(<CanvasView session={session} />);

    // Check HUD is present with session values
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Tiles/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check Canvas is present
    expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
  });

  it('initializes CanvasController on mount', () => {
    render(<CanvasView session={session} />);

    expect(CanvasController).toHaveBeenCalled();
  });

  it('cleans up CanvasController on unmount', () => {
    const { unmount } = render(<CanvasView session={session} />);

    const controllerInstance = vi.mocked(CanvasController).mock.results[0].value;
    unmount();

    expect(controllerInstance.destroy).toHaveBeenCalled();
  });
});
