import {
    describe,
    it,
    expect,
    beforeEach,
} from 'vitest';
import {Game} from './Game';
import {Board} from './Board';
import {GameRules} from './GameRules';
import {Tile, TileProps} from './Tile';
import {HexCoordinate} from './HexCoordinate';
import {Navigation} from './Navigation';

describe('Game', () => {
    let board: Board;
    let rules: GameRules;
    
    beforeEach(() => {
        board = new Board();
        rules = new GameRules({
            initialTurns: 30,
        });
    });
    
    describe('Factory Methods', () => {
        it('should create a game with an initial tile placed at origin', () => {
            const customRules = new GameRules({
                initialTurns: 10,
                initialTile: {
                    north: 'pasture',
                    northEast: 'pasture',
                    southEast: 'pasture',
                    south: 'pasture',
                    southWest: 'pasture',
                    northWest: 'pasture',
                },
            });
            
            const game = Game.create(customRules);
            
            expect(game.rules).toBe(customRules);
            expect(game.remainingTurns).toBe(10);
            // Verify initial tile is placed at origin
            const origin = new HexCoordinate(0, 0, 0);
            const placedTile = game.board.get(origin);
            
            expect(placedTile).toBeDefined();
            expect(placedTile?.tile.north).toBe('pasture');
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
        expect(game.remainingTurns).toBe(30);
        expect(game.tileQueue.length).toBe(30);
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
        
        const game = new Game({
            board,
            rules,
            tileQueue: [tile],
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
        
        const game = new Game({
            board,
            rules,
            tileQueue: [tile],
        });
        
        expect(game.peek()).toBe(tile);
        expect(game.remainingTurns).toBe(1);
    });
    
    describe('isValidPlacement', () => {
        it('should return false if the position is already occupied', () => {
            const coord = new HexCoordinate(0, 0, 0);
            board.place(Tile.createRandom('t1'), coord);
            const game = new Game({
                board,
                rules,
            });
            
            expect(game.isValidPlacement(coord)).toBe(false);
        });
        
        it('should return false if the position is not adjacent to any existing tile', () => {
            const origin = new HexCoordinate(0, 0, 0);
            board.place(Tile.createRandom('t1'), origin);
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
            board.place(Tile.createRandom('t1'), origin);
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
    
    describe('isPerfect', () => {
        it('should return false if there is no tile at the coordinate', () => {
            const game = new Game({
                board,
                rules,
            });
            expect(game.isPerfect(new HexCoordinate(0, 0, 0))).toBe(false);
        });
        
        it('should return false if the tile has fewer than 6 neighbors', () => {
            const origin = new HexCoordinate(0, 0, 0);
            const neighbor = new HexCoordinate(1, 0, -1);
            const tile = Tile.createRandom('t1');
            
            board.place(tile, origin);
            board.place(Tile.createRandom('t2'), neighbor);
            const game = new Game({
                board,
                rules,
            });
            
            expect(game.isPerfect(origin)).toBe(false);
        });
        
        it('should return false if any neighbor terrain does not match', () => {
            const origin = new HexCoordinate(0, 0, 0);
            const tile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            
            board.place(tile, origin);
            // Place 6 neighbors, but one doesn't match
            const nav = new Navigation();
            
            for (const [i, n] of nav
                .getNeighbors(origin)
                .entries()) {
                const neighborTile = new Tile({
                    id: `n${i}`,
                    north: 'pasture',
                    northEast: 'pasture',
                    southEast: 'pasture',
                    south: 'pasture',
                    southWest: 'pasture',
                    northWest: 'pasture',
                });
                
                board.place(neighborTile, n.coordinate);
            }
            
            const game = new Game({
                board,
                rules,
            });
            expect(game.isPerfect(origin)).toBe(false);
        });
        
        it('should return true if all 6 neighbors exist and all terrains match', () => {
            const origin = new HexCoordinate(0, 0, 0);
            const tile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            
            board.place(tile, origin);
            
            const nav = new Navigation();
            
            for (const [i, n] of nav
                .getNeighbors(origin)
                .entries()) {
                const opposite = nav.getOpposite(n.direction);
                const neighborProps: TileProps = {
                    id: `n${i}`,
                    north: 'pasture',
                    northEast: 'pasture',
                    southEast: 'pasture',
                    south: 'pasture',
                    southWest: 'pasture',
                    northWest: 'pasture',
                };
                
                neighborProps[opposite] = 'tree'; // Match the center tile
                board.place(new Tile(neighborProps), n.coordinate);
            }
            
            const game = new Game({
                board,
                rules,
            });
            expect(game.isPerfect(origin)).toBe(true);
        });
    });
    
    describe('placeTile with Perfect Scoring', () => {
        it('should award standard points and no perfect bonus for a simple match', () => {
            const origin = new HexCoordinate(0, 0, 0);
            const t1 = new Tile({
                id: 't1',
                north: 'tree',
                northEast: 'pasture',
                southEast: 'pasture',
                south: 'pasture',
                southWest: 'pasture',
                northWest: 'pasture',
            });
            
            board.place(t1, origin);
            
            const t2 = new Tile({
                id: 't2',
                north: 'pasture',
                northEast: 'pasture',
                southEast: 'pasture',
                south: 'tree',
                southWest: 'pasture',
                northWest: 'pasture',
            });
            
            const game = new Game({
                board,
                rules,
                tileQueue: [t2],
            });
            const northOfOrigin = new HexCoordinate(-1, 0, 1);
            
            const result = game.placeTile(northOfOrigin);
            
            expect(result.scoreAdded).toBe(10); // Standard match
            expect(result.perfectCount).toBe(0);
            expect(game.score).toBe(10);
            expect(game.remainingTurns).toBe(0);
        });
        
        it('should award perfect bonus and extra turn when tile becomes perfect', () => {
            const origin = new HexCoordinate(0, 0, 0);
            const nav = new Navigation();
            
            // Surround origin with 5 matching neighbors
            nav
                .getNeighbors(origin)
                .slice(0, 5)
                .forEach((n, i) => {
                    const opposite = nav.getOpposite(n.direction);
                    const props: TileProps = {
                        id: `n${i}`,
                        north: 'pasture',
                        northEast: 'pasture',
                        southEast: 'pasture',
                        south: 'pasture',
                        southWest: 'pasture',
                        northWest: 'pasture',
                    };
                    
                    props[opposite] = 'tree';
                    board.place(new Tile(props), n.coordinate);
                });

            // The center tile
            const centerTile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            
            // Last neighbor to complete the circle
            const lastNeighborInfo = nav.getNeighbors(origin)[5];
            const opposite = nav.getOpposite(lastNeighborInfo.direction);
            
            const lastNeighborProps: TileProps = {
                id: 'last-neighbor',
                north: 'pasture',
                northEast: 'pasture',
                southEast: 'pasture',
                south: 'pasture',
                southWest: 'pasture',
                northWest: 'pasture',
            };
            
            lastNeighborProps[opposite] = 'tree';
            const lastNeighbor = new Tile(lastNeighborProps);
            
            const game = new Game({
                board,
                rules,
                tileQueue: [centerTile],
            });
            
            // We are placing the center tile into a hole surrounded by 5 neighbors.
            // Wait, to make it perfect it needs 6 neighbors.
            // Let's place the 6th neighbor first.
            board.place(lastNeighbor, lastNeighborInfo.coordinate);
            
            const result = game.placeTile(origin);
            
            // 6 matching edges = 60 points
            // 1 perfect tile = 60 points bonus
            // Total = 120 points
            expect(result.scoreAdded).toBe(120);
            expect(result.perfectCount).toBe(1);
            expect(game.score).toBe(120);
            // Started with 1 tile, placed it -> 0. Bonus +1 -> 1.
            expect(game.remainingTurns).toBe(1);
        });
        
        it('should award cascading perfect bonuses if neighbors also become perfect', () => {
            const nav = new Navigation();
            const origin = new HexCoordinate(0, 0, 0);
            
            // We want to place a tile at origin that makes a neighbor perfect.
            // Neighbor at North (-1, 0, 1) needs 6 neighbors.
            // One of those is origin.
            const neighborCoord = new HexCoordinate(-1, 0, 1);
            
            const neighborTile = new Tile({
                id: 'neighbor',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            
            board.place(neighborTile, neighborCoord);
            // Surround neighbor with its other 5 neighbors (excluding origin)
            
            for (const [i, n] of nav
                .getNeighbors(neighborCoord)
                .entries()) {
                if (n.coordinate.getKey() === origin.getKey())
                    continue;
                
                const opposite = nav.getOpposite(n.direction);
                const props: TileProps = {
                    id: `nn${i}`,
                    north: 'pasture',
                    northEast: 'pasture',
                    southEast: 'pasture',
                    south: 'pasture',
                    southWest: 'pasture',
                    northWest: 'pasture',
                };
                
                props[opposite] = 'tree';
                board.place(new Tile(props), n.coordinate);
            }
            
            // Tile to place at origin that matches neighbor at its South side
            const centerTile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'pasture',
                southEast: 'pasture',
                south: 'pasture',
                southWest: 'pasture',
                northWest: 'pasture',
            });
            
            const game = new Game({
                board,
                rules,
                tileQueue: [centerTile],
            });
            
            const result = game.placeTile(origin);
            
            // neighbor was NOT perfect (missing origin neighbor).
            // Now it has origin and it matches.
            // centerTile is NOT perfect (only has 3 neighbors: neighborTile, and two of its neighbors).
            // Points: 3 matches (30) + 1 perfect neighbor (60) = 90
            expect(result.scoreAdded).toBe(90);
            expect(result.perfectCount).toBe(1);
            expect(game.remainingTurns).toBe(1); // 1-1 + 1 bonus
        });
        
        it('should award multiple bonuses if two neighbors become perfect simultaneously', () => {
            const nav = new Navigation();
            const origin = new HexCoordinate(0, 0, 0);
            
            // Setup: two neighbors (North and NorthEast) are each missing exactly one tile (origin) to be perfect.
            const n1Coord = new HexCoordinate(-1, 0, 1); // North
            const n2Coord = new HexCoordinate(-1, 1, 0); // NorthEast
            
            const createPerfectCandidate = (coord: HexCoordinate) => {
                // Candidate is ALL 'tree'
                if (!board.has(coord)) {
                    const tile = new Tile({
                        id: `candidate-${coord.getKey()}`,
                        north: 'tree',
                        northEast: 'tree',
                        southEast: 'tree',
                        south: 'tree',
                        southWest: 'tree',
                        northWest: 'tree',
                    });
                    board.place(tile, coord);
                }
                
                // Surround with its 5 other neighbors.
                // Each neighbor MUST have 'tree' on the side facing the candidate.
                for (const n of nav.getNeighbors(coord)) {
                    if (n.coordinate.getKey() === origin.getKey())
                        continue;
                    if (board.has(n.coordinate)) {
                        // If it exists (shared neighbor), we must ensure it matches our candidate's side.
                        // For simplicity in this test, we use 'tree' everywhere for neighbors too.
                        continue;
                    }
                    
                    const props: TileProps = {
                        id: `nn-${coord.getKey()}-${n.direction}`,
                        north: 'tree',
                        northEast: 'tree',
                        southEast: 'tree',
                        south: 'tree',
                        southWest: 'tree',
                        northWest: 'tree',
                    };
                    // Facing side is tree, others are tree. It's all tree.
                    board.place(new Tile(props), n.coordinate);
                }
            };
            
            createPerfectCandidate(n1Coord);
            createPerfectCandidate(n2Coord);
            
            // Tile to place at origin that matches both neighbors
            // n1 (North of origin) matches at its South side (origin's North)
            // n2 (NorthEast of origin) matches at its SouthWest side (origin's NorthEast)
            const centerTile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'tree',
                southEast: 'pasture',
                south: 'pasture',
                southWest: 'pasture',
                northWest: 'pasture',
            });
            
            const game = new Game({
                board,
                rules,
                tileQueue: [centerTile],
            });
            const result = game.placeTile(origin);
            
            // 2 matches (20) + 2 perfect neighbors (120) = 140
            expect(result.perfectCount).toBe(2);
            expect(result.scoreAdded).toBe(140);
            expect(game.remainingTurns).toBe(2); // 1-1 + 2 bonus
        });
        
        it('should award bonuses for both the placed tile and a neighbor becoming perfect', () => {
            const nav = new Navigation();
            const origin = new HexCoordinate(0, 0, 0);
            
            // 1. Setup neighbor at North to become perfect
            // Neighbor is all 'tree'
            const neighborCoord = new HexCoordinate(-1, 0, 1);
            const neighborTile = new Tile({
                id: 'neighbor',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            board.place(neighborTile, neighborCoord);
            
            // Surround neighbor with 5 neighbors (all 'tree')
            for (const n of nav.getNeighbors(neighborCoord)) {
                if (n.coordinate.getKey() === origin.getKey())
                    continue;
                if (board.has(n.coordinate))
                    continue;
                
                const props: TileProps = {
                    id: `nn-${n.direction}`,
                    north: 'tree',
                    northEast: 'tree',
                    southEast: 'tree',
                    south: 'tree',
                    southWest: 'tree',
                    northWest: 'tree',
                };
                board.place(new Tile(props), n.coordinate);
            }
            
            // 2. Setup origin to ALSO become perfect when placed
            // It already has neighborCoord. Now add the other 5.
            // Origin will be all 'tree'
            for (const n of nav.getNeighbors(origin)) {
                if (n.coordinate.getKey() === neighborCoord.getKey())
                    continue;
                if (board.has(n.coordinate))
                    continue;
                
                const props: TileProps = {
                    id: `on-${n.direction}`,
                    north: 'tree',
                    northEast: 'tree',
                    southEast: 'tree',
                    south: 'tree',
                    southWest: 'tree',
                    northWest: 'tree',
                };
                board.place(new Tile(props), n.coordinate);
            }
            
            const centerTile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'tree',
                southEast: 'tree',
                south: 'tree',
                southWest: 'tree',
                northWest: 'tree',
            });
            
            const game = new Game({
                board,
                rules,
                tileQueue: [centerTile],
            });
            const result = game.placeTile(origin);
            
            // 6 matches (60) + 2 perfect tiles (120) = 180
            expect(result.perfectCount).toBe(2);
            expect(result.scoreAdded).toBe(180);
            expect(game.remainingTurns).toBe(2);
        });
        
        it('should correctly handle diverse terrain types in a perfect placement', () => {
            const nav = new Navigation();
            const origin = new HexCoordinate(0, 0, 0);
            
            const centerTile = new Tile({
                id: 'center',
                north: 'tree',
                northEast: 'water',
                southEast: 'house',
                south: 'pasture',
                southWest: 'field',
                northWest: 'rail',
            });
            
            // Place 6 neighbors that perfectly match the diverse center
            nav.getNeighbors(origin).forEach((n) => {
                const myTerrain = centerTile.getTerrain(n.direction);
                const opposite = nav.getOpposite(n.direction);
                
                const props: TileProps = {
                    id: `n-${n.direction}`,
                    north: 'tree',
                    northEast: 'tree',
                    southEast: 'tree',
                    south: 'tree',
                    southWest: 'tree',
                    northWest: 'tree',
                };
                props[opposite] = myTerrain;
                board.place(new Tile(props), n.coordinate);
            });
            
            const game = new Game({
                board,
                rules,
                tileQueue: [centerTile],
            });
            const result = game.placeTile(origin);
            
            expect(result.perfectCount).toBe(1);
            expect(result.scoreAdded).toBe(120); // 60 (matches) + 60 (perfect)
        });
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
            const game = new Game({
                board,
                rules,
                tileQueue: [tile],
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
            const game = new Game({
                board,
                rules,
                tileQueue: [tile],
            });
            
            game.rotateQueuedTileCounterClockwise();
            
            const rotated = game.peek()!;
            expect(rotated.north).toBe('field');
        });
        
        it('should throw error if queue is empty', () => {
            const game = new Game({
                board,
                rules,
                tileQueue: [],
            });
            expect(() => game.rotateQueuedTileClockwise()).toThrow('No tiles remaining in the queue');
        });
    });
});
