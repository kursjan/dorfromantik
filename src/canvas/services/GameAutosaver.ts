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

  handleTilePlaced = () => {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      this.executeSave();
    }, this.debounceMs);
  };

  private executeSave = () => {
    const game = this.getActiveGame();
    if (!game) return;

    this.onSaveStart?.();

    // Create a 5-second timeout promise to catch hanging offline saves
    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Save timeout (Offline)')), 5000);
    });

    Promise.race([
      this.firestoreService.saveGameState(this.getUserId(), game),
      timeoutPromise
    ])
      .then(() => {
        this.onSaveSuccess?.();
      })
      .catch((err) => {
        console.error('Failed to save game state', err);
        this.onSaveError?.(err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
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

