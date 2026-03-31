import { Game } from './Game';
import { Board } from './Board';
import { Tile, type TerrainId } from './Tile';
import { toTerrain } from './Terrain';
import { HexCoordinate } from './HexCoordinate';
import { GameRules } from './GameRules';

export interface HexCoordinateJSON {
  q: number;
  r: number;
  s: number;
}

export interface TileJSON {
  id: string;
  center?: TerrainId;
  north: TerrainId;
  northEast: TerrainId;
  southEast: TerrainId;
  south: TerrainId;
  southWest: TerrainId;
  northWest: TerrainId;
}

export interface BoardTileJSON {
  tile: TileJSON;
  coordinate: HexCoordinateJSON;
}

export interface BoardJSON {
  tiles: BoardTileJSON[];
}

export interface GameRulesJSON {
  initialTurns: number;
  pointsPerMatch: number;
  pointsPerPerfect: number;
  turnsPerPerfect: number;
}

export interface GameJSON {
  id: string;
  name: string;
  lastPlayed: string;
  score: number;
  board: BoardJSON;
  tileQueue: TileJSON[];
  rules: GameRulesJSON;
}

/**
 * Utility class to serialize and deserialize Game instances.
 * Serialization reads current state only; deserialization always builds **new** domain objects.
 *
 * **Immutable reconstruction:** `deserialize` rebuilds the board by replaying placements on an
 * empty `Board` (each `place` returns a new board instance). The returned `Game` is a fresh
 * instance; it does not share references with any previously serialized game object.
 */
export class GameSerializer {
  /**
   * Serializes a Game instance to a plain JSON object.
   */
  static serialize(game: Game): GameJSON {
    const tileQueue = [...game.tileQueue];
    return {
      id: game.id,
      name: game.name,
      lastPlayed: game.lastPlayed,
      score: game.score,
      board: this.serializeBoard(game.board),
      tileQueue: tileQueue.map((tile) => this.serializeTile(tile)),
      rules: this.serializeRules(game.rules),
    };
  }

  /**
   * Deserializes a plain JSON object back into a Game instance.
   */
  static deserialize(json: GameJSON): Game {
    const rules = this.deserializeRules(json.rules);
    const board = this.deserializeBoard(json.board);
    const tileQueue = json.tileQueue.map((t) => this.deserializeTile(t));

    return new Game({
      id: json.id,
      name: json.name,
      lastPlayed: json.lastPlayed,
      score: json.score,
      rules,
      board,
      tileQueue,
    });
  }

  private static serializeBoard(board: Board): BoardJSON {
    const tiles: BoardTileJSON[] = [];
    for (const boardTile of board.getAll()) {
      tiles.push({
        tile: this.serializeTile(boardTile.tile),
        coordinate: this.serializeCoordinate(boardTile.coordinate),
      });
    }
    return { tiles };
  }

  private static deserializeBoard(json: BoardJSON): Board {
    let board = new Board();
    for (const entry of json.tiles) {
      const tile = this.deserializeTile(entry.tile);
      const coord = this.deserializeCoordinate(entry.coordinate);
      board = board.withTile(tile, coord);
    }
    return board;
  }

  private static serializeTile(tile: Tile): TileJSON {
    return {
      id: tile.id,
      center: tile.center?.id,
      north: tile.north.id,
      northEast: tile.northEast.id,
      southEast: tile.southEast.id,
      south: tile.south.id,
      southWest: tile.southWest.id,
      northWest: tile.northWest.id,
    };
  }

  private static deserializeTile(json: TileJSON): Tile {
    return new Tile({
      id: json.id,
      center: json.center !== undefined ? toTerrain(json.center) : undefined,
      north: toTerrain(json.north),
      northEast: toTerrain(json.northEast),
      southEast: toTerrain(json.southEast),
      south: toTerrain(json.south),
      southWest: toTerrain(json.southWest),
      northWest: toTerrain(json.northWest),
    });
  }

  private static serializeCoordinate(coord: HexCoordinate): HexCoordinateJSON {
    return {
      q: coord.q,
      r: coord.r,
      s: coord.s,
    };
  }

  private static deserializeCoordinate(json: HexCoordinateJSON): HexCoordinate {
    return new HexCoordinate(json.q, json.r, json.s);
  }

  private static serializeRules(rules: GameRules): GameRulesJSON {
    return {
      initialTurns: rules.initialTurns,
      pointsPerMatch: rules.pointsPerMatch,
      pointsPerPerfect: rules.pointsPerPerfect,
      turnsPerPerfect: rules.turnsPerPerfect,
    };
  }

  private static deserializeRules(json: GameRulesJSON): GameRules {
    // Note: We use standard generators during deserialization for now.
    // If we need to support custom generators, we'll need to expand GameRulesJSON.
    return new GameRules({
      initialTurns: json.initialTurns,
      pointsPerMatch: json.pointsPerMatch,
      pointsPerPerfect: json.pointsPerPerfect,
      turnsPerPerfect: json.turnsPerPerfect,
    });
  }
}
