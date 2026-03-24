import React from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Board } from '../../models/Board';
import { Game } from '../../models/Game';
import { Tile } from '../../models/Tile';
import { GameRules } from '../../models/GameRules';
import { CanvasController } from '../engine/CanvasController';
import { CanvasView } from './CanvasView';
import { ServiceProvider } from '../../services/ServiceProvider';
import { InMemoryAuthService } from '../../services/auth/InMemoryAuthService';
import { InMemoryFirestoreService } from '../../services/firestore/InMemoryFirestoreService';

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
  const authService = new InMemoryAuthService();
  const firestoreService = new InMemoryFirestoreService();
  let game: Game;

  beforeEach(() => {
    authService._resetMockStore();
    firestoreService._resetMockStore();
    const board = new Board();
    const rules = new GameRules();
    game = new Game({ board, rules, tileQueue: [new Tile(), new Tile()], score: 100 });
    vi.clearAllMocks();
  });

  function renderWithProvider(ui: React.ReactElement) {
    return render(
      <ServiceProvider authService={authService} firestoreService={firestoreService}>
        {ui}
      </ServiceProvider>
    );
  }

  const noopOnTilePlaced = () => {};

  it('renders correctly with HUD and Canvas', () => {
    renderWithProvider(<CanvasView activeGame={game} onTilePlaced={noopOnTilePlaced} />);

    // Check HUD is present with session values
    expect(screen.getByText(/Score/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/Tiles/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check Canvas is present
    expect(screen.getByTestId('game-canvas')).toBeInTheDocument();
  });

  it('initializes CanvasController on mount', () => {
    renderWithProvider(<CanvasView activeGame={game} onTilePlaced={noopOnTilePlaced} />);

    expect(CanvasController).toHaveBeenCalled();
  });

  it('cleans up CanvasController on unmount', () => {
    const { unmount } = renderWithProvider(
      <CanvasView activeGame={game} onTilePlaced={noopOnTilePlaced} />
    );

    const controllerInstance = vi.mocked(CanvasController).mock.results[0].value;
    unmount();

    expect(controllerInstance.destroy).toHaveBeenCalled();
  });
});
