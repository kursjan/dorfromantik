import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CanvasView } from './CanvasView';
import { Session } from '../../models/Session';
import { User } from '../../models/User';
import { Game } from '../../models/Game';
import { Board } from '../../models/Board';
import { GameRules } from '../../models/GameRules';
import { CanvasController } from '../engine/CanvasController';

// Mock CanvasController
vi.mock('../engine/CanvasController', () => {
  const MockController = vi.fn();
  MockController.prototype.destroy = vi.fn();
  MockController.prototype.resetCamera = vi.fn();
  return {
    CanvasController: MockController,
  };
});

describe('CanvasView', () => {
  let session: Session;
  let game: Game;

  beforeEach(() => {
    const user = new User('test-user');
    const board = new Board();
    const rules = new GameRules({ initialTurns: 25 });
    game = new Game({ board, rules, score: 100 });
    session = new Session('test-session', user, game);
    vi.clearAllMocks();
  });

  it('renders correctly with HUD and Canvas', () => {
    render(<CanvasView session={session} />);
    
    // Check HUD is present with session values
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Tiles/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    
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
