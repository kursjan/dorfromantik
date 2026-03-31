import type { IFirestoreService } from '../../services/firestore/IFirestoreService';
import type { Game } from '../../models/Game';

type GameProvider = () => Game | undefined;
type UserIdProvider = () => string;

export class GameAutosaver {
  private readonly firestoreService: IFirestoreService;
  private readonly getUserId: UserIdProvider;
  private readonly getActiveGame: GameProvider;
  private readonly debounceMs: number;
  private readonly onSaveStart?: () => void;
  private readonly onSaveSuccess?: () => void;
  private readonly onSaveError?: (error: unknown) => void;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: {
    firestoreService: IFirestoreService;
    getUserId: UserIdProvider;
    getActiveGame: GameProvider;
    debounceMs: number;
    onSaveStart?: () => void;
    onSaveSuccess?: () => void;
    onSaveError?: (error: unknown) => void;
  }) {
    this.firestoreService = options.firestoreService;
    this.getUserId = options.getUserId;
    this.getActiveGame = options.getActiveGame;
    this.debounceMs = options.debounceMs;
    this.onSaveStart = options.onSaveStart;
    this.onSaveSuccess = options.onSaveSuccess;
    this.onSaveError = options.onSaveError;
  }

  handleGameChanged = (previousGame: Game | undefined, currentGame: Game | undefined) => {
    if (!this.didGameplayStateChange(previousGame, currentGame)) {
      return;
    }

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.executeSave();
    }, this.debounceMs);
  };

  private didGameplayStateChange(
    previousGame: Game | undefined,
    currentGame: Game | undefined
  ): boolean {
    if (!previousGame || !currentGame) {
      return false;
    }
    if (previousGame === currentGame) {
      return false;
    }
    // Treat session switches/load restores as non-gameplay transitions.
    if (previousGame.id !== currentGame.id) {
      return false;
    }

    // Rotation-only changes should not schedule autosave.
    return (
      previousGame.board !== currentGame.board ||
      previousGame.score !== currentGame.score ||
      previousGame.remainingTurns !== currentGame.remainingTurns
    );
  }

  private executeSave = () => {
    const game = this.getActiveGame();
    if (!game) return;

    this.onSaveStart?.();

    let isSettled = false;
    const timeoutId = setTimeout(() => {
      if (!isSettled) {
        const error = new Error('Save timeout (Offline)');
        console.error('Failed to save game state', error);
        this.onSaveError?.(error);
      }
    }, 5000);

    this.firestoreService
      .saveGameState(this.getUserId(), game)
      .then(() => {
        isSettled = true;
        clearTimeout(timeoutId);
        this.onSaveSuccess?.();
      })
      .catch((err) => {
        isSettled = true;
        clearTimeout(timeoutId);
        console.error('Failed to save game state', err);
        this.onSaveError?.(err);
      });
  };

  forceSaveAndDispose(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
      this.executeSave();
    }
  }

  dispose(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
}
