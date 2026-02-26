import {
    describe,
    it,
    expect,
    beforeEach,
} from 'vitest';
import {Game} from './Game';
import {Board} from './Board';
import {GameRules, RandomTileGenerator, SequenceTileGenerator} from './GameRules';
import {Tile} from './Tile';
import {HexCoordinate} from './HexCoordinate';
// Add missing tests: https://github.com/kursjan/dorfromantik/issues/35
describe('Game', () => {
    let board: Board;
    let rules: GameRules;
    const randomGenerator = new RandomTileGenerator();
    
    beforeEach(() => {
        board = new Board();
        rules = new GameRules({
            initialTurns: 30,
        });
    });
    
    describe('Factory Methods', () => {
        it('should create a game with an initial tile placed at origin', () => {
            const startTile = new Tile({
                id: 'custom-start',
                north: 'tree',
                northEast: 'pasture',
                southEast: 'pasture',
                south: 'rail',
                southWest: 'pasture',
                northWest: 'pasture',
            });

            const customRules = new GameRules({
                initialTurns: 10,
                initialTileGenerator: new SequenceTileGenerator([startTile]),
            });
            
            const game = Game.create(customRules);
            
            expect(game.rules).toBe(customRules);
            expect(game.remainingTurns).toBe(10);
            // Verify initial tile is placed at origin
            const origin = new HexCoordinate(0, 0, 0);
            const placedTile = game.board.get(origin);
            
            expect(placedTile).toBeDefined();
            expect(placedTile?.tile).toBe(startTile);
        });
        
        it('should create a standard game with a pasture starter tile', () => {
            const game = Game.createStandard();
            
            expect(game.remainingTurns).toBe(30);
            
            const origin = new HexCoordinate(0, 0, 0);
            const placedTile = game.board.get(origin);
            
            expect(placedTile).toBeDefined();
            const {tile} = placedTile!;
            expect(tile.north).toBe('pasture');
            expect(tile.northEast).toBe('pasture');
            expect(tile.southEast).toBe('pasture');
            expect(tile.south).toBe('pasture');
            expect(tile.southWest).toBe('pasture');
            expect(tile.northWest).toBe('pasture');
        });
    });
    
    it('should initialize with correct default values and random tiles', () => {
        const game = new Game({
            board,
            rules,
        });
        expect(game.board).toBe(board);
        expect(game.rules).toBe(rules);
        expect(game.score).toBe(0);
    });
    
    it('should allow setting a custom initial tile queue', () => {
        const tile = new Tile({
            id: 't1',
            north: 'tree',
            northEast: 'tree',
            southEast: 'tree',
            south: 'tree',
            southWest: 'tree',
            northWest: 'tree',
        });
        
        // Note: initialTurns must match the length of the sequence if we want exact control
        const customRules = new GameRules({
            initialTurns: 1,
            tileGenerator: new SequenceTileGenerator([tile]),
        });

        const game = new Game({
            board,
            rules: customRules,
        });
        expect(game.tileQueue).toEqual([tile]);
        expect(game.remainingTurns).toBe(1);
    });
    
    it('should peek the top of the queue without removing it', () => {
        const tile = new Tile({
            id: 't1',
            north: 'tree',
            northEast: 'tree',
            southEast: 'tree',
            south: 'tree',
            southWest: 'tree',
            northWest: 'tree',
        });
        
        const customRules = new GameRules({
            initialTurns: 1,
            tileGenerator: new SequenceTileGenerator([tile]),
        });

        const game = new Game({
            board,
            rules: customRules,
        });
        
        expect(game.peek()).toBe(tile);
        expect(game.remainingTurns).toBe(1);
    });
    
    describe('isValidPlacement', () => {
        it('should return false if the position is already occupied', () => {
            const coord = new HexCoordinate(0, 0, 0);
            board.place(randomGenerator.createTile('t1'), coord);
            const game = new Game({
                board,
                rules,
            });
            
            expect(game.isValidPlacement(coord)).toBe(false);
        });
        
        it('should return false if the position is not adjacent to any existing tile', () => {
            const origin = new HexCoordinate(0, 0, 0);
            board.place(randomGenerator.createTile('t1'), origin);
            const game = new Game({
                board,
                rules,
            });
            
            // (2, 0, -2) is not adjacent to (0, 0, 0)
            const farCoord = new HexCoordinate(2, 0, -2);
            
            expect(game.isValidPlacement(farCoord)).toBe(false);
        });
        
        it('should return true if the position is empty and adjacent to an existing tile', () => {
            const origin = new HexCoordinate(0, 0, 0);
            board.place(randomGenerator.createTile('t1'), origin);
            const game = new Game({
                board,
                rules,
            });
            
            // (1, 0, -1) is adjacent to (0, 0, 0)
            const adjCoord = new HexCoordinate(1, 0, -1);
            
            expect(game.isValidPlacement(adjCoord)).toBe(true);
        });
    });
    
    it('should throw error if score is negative', () => {
        expect(() => new Game({
            board,
            rules,
            score: -10,
        })).toThrow('score must be non-negative');
    });
    
    describe('rotateQueuedTile', () => {
        it('should rotate the next tile in the queue clockwise', () => {
            const tile = new Tile({
                id: 't1',
                north: 'tree',
                northEast: 'house',
                southEast: 'water',
                south: 'pasture',
                southWest: 'rail',
                northWest: 'field',
            });
            
            const customRules = new GameRules({
                initialTurns: 1,
                tileGenerator: new SequenceTileGenerator([tile]),
            });

            const game = new Game({
                board,
                rules: customRules,
            });
            
            game.rotateQueuedTileClockwise();
            
            const rotated = game.peek()!;
            expect(rotated.north).toBe('house');
        });
        
        it('should rotate the next tile in the queue counter-clockwise', () => {
            const tile = new Tile({
                id: 't1',
                north: 'tree',
                northEast: 'house',
                southEast: 'water',
                south: 'pasture',
                southWest: 'rail',
                northWest: 'field',
            });
            
            const customRules = new GameRules({
                initialTurns: 1,
                tileGenerator: new SequenceTileGenerator([tile]),
            });

            const game = new Game({
                board,
                rules: customRules,
            });
            
            game.rotateQueuedTileCounterClockwise();
            
            const rotated = game.peek()!;
            expect(rotated.north).toBe('field');
        });
        
        it('should throw error if queue is empty', () => {
            const customRules = new GameRules({
                initialTurns: 0,
                tileGenerator: new SequenceTileGenerator([]),
            });
            
            const game = new Game({
                board,
                rules: customRules,
            });
            expect(() => game.rotateQueuedTileClockwise()).toThrow('No tiles remaining in the queue');
        });
    });
});
