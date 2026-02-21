import { describe, it, expect, beforeEach } from 'vitest';
import { Session } from './Session';
import { User } from './User';
import { Game } from './Game';
import { Board } from './Board';
import { GameRules } from './GameRules';

describe('Session', () => {
  let user: User;
  let gameRules: GameRules;
  let board: Board;

  beforeEach(() => {
    user = new User('user-123');
    gameRules = new GameRules({ initialTurns: 10, pointsPerMatch: 10 });
    board = new Board();
  });

  it('should initialize with a sessionId and user', () => {
    const session = new Session('session-456', user);
    expect(session.sessionId).toBe('session-456');
    expect(session.user).toBe(user);
    expect(session.activeGame).toBeUndefined();
    expect(session.games).toEqual([]);
  });

  it('should allow starting a new game', () => {
    const session = new Session('session-456', user);
    const game = new Game({ board, rules: gameRules });
    
    session.startNewGame(game);
    
    expect(session.activeGame).toBe(game);
  });

  it('should move the active game to history when ending it', () => {
    const session = new Session('session-456', user);
    const game = new Game({ board, rules: gameRules });
    
    session.startNewGame(game);
    session.endActiveGame();
    
    expect(session.activeGame).toBeUndefined();
    expect(session.games).toContain(game);
    expect(session.games.length).toBe(1);
  });

  it('should throw an error if ending a game when none is active', () => {
    const session = new Session('session-456', user);
    expect(() => session.endActiveGame()).toThrow('No active game to end');
  });

  it('should automatically archive the current active game when starting a new one', () => {
    const session = new Session('session-456', user);
    const game1 = new Game({ board, rules: gameRules });
    const game2 = new Game({ board, rules: gameRules });
    
    session.startNewGame(game1);
    session.startNewGame(game2);
    
    expect(session.activeGame).toBe(game2);
    expect(session.games).toContain(game1);
    expect(session.games.length).toBe(1);
  });
});
