import { Game } from './Game';
import { Board } from './Board';
import { Tile, type TerrainType } from './Tile';
import { HexCoordinate } from './HexCoordinate';
import { GameRules } from './GameRules';

export interface HexCoordinateJSON {
  q: number;
  r: number;
  s: number;
}

export interface TileJSON {
  id: string;
  north: TerrainType;
  northEast: TerrainType;
  southEast: TerrainType;
  south: TerrainType;
  southWest: TerrainType;
  northWest: TerrainType;
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
 * Ensures that class instances are properly reconstructed from plain JSON.
 */
export class GameSerializer {
  /**
   * Serializes a Game instance to a plain JSON object.
   */
  static serialize(game: Game): GameJSON {
    return {
      id: game.id,
      name: game.name,
      lastPlayed: game.lastPlayed,
      score: game.score,
      board: this.serializeBoard(game.board),
      tileQueue: game.tileQueue.map((tile) => this.serializeTile(tile)),
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
    const board = new Board();
    for (const entry of json.tiles) {
      const tile = this.deserializeTile(entry.tile);
      const coord = this.deserializeCoordinate(entry.coordinate);
      board.place(tile, coord);
    }
    return board;
  }

  private static serializeTile(tile: Tile): TileJSON {
    return {
      id: tile.id,
      north: tile.north,
      northEast: tile.northEast,
      southEast: tile.southEast,
      south: tile.south,
      southWest: tile.southWest,
      northWest: tile.northWest,
    };
  }

  private static deserializeTile(json: TileJSON): Tile {
    return new Tile({
      id: json.id,
      north: json.north,
      northEast: json.northEast,
      southEast: json.southEast,
      south: json.south,
      southWest: json.southWest,
      northWest: json.northWest,
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
