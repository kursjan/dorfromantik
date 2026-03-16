import type { IFirestoreService } from '../../services/firestore/IFirestoreService';
import type { Game } from '../../models/Game';

type GameProvider = () => Game | undefined;
type UserIdProvider = () => string;

export class GameAutosaver {
  private readonly firestoreService: IFirestoreService;
  private readonly getUserId: UserIdProvider;
  private readonly getActiveGame: GameProvider;
  private readonly debounceMs: number;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: {
    firestoreService: IFirestoreService;
    getUserId: UserIdProvider;
    getActiveGame: GameProvider;
    debounceMs: number;
  }) {
    this.firestoreService = options.firestoreService;
    this.getUserId = options.getUserId;
    this.getActiveGame = options.getActiveGame;
    this.debounceMs = options.debounceMs;
  }

  handleTilePlaced = () => {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(() => {
      const game = this.getActiveGame();
      if (!game) return;

      this.firestoreService
        .saveGameState(this.getUserId(), game)
        .catch((err) => console.error('Failed to save game state', err));
    }, this.debounceMs);
  };

  dispose(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }
}

