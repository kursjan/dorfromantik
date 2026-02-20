# Printer Module Architecture

This document outlines the architecture of the `printers` module, which is responsible for converting the logical representation of the game board into a string format suitable for console output.

## Core Concepts

The printing process is a two-pass operation:

1.  **Bounds Calculation:** The first pass iterates through all the tiles on the board to determine the final dimensions of the output canvas. This is necessary because tiles can be placed at any coordinate, including negative coordinates, and we need to know the bounding box of all tiles to create a canvas of the correct size.
2.  **Rendering:** The second pass iterates through the tiles again, this time rendering each one onto the canvas at its correct position.

This two-pass approach ensures that the output is perfectly sized to fit the board, with no unnecessary whitespace.

## Key Components

### 1. `BoardPrinter`

- **Responsibility:** The main entry point for printing a `Board` object. It orchestrates the entire printing process.
- **Logic:**
  - Initializes a `CanvasBoundsFactory` to manage the calculation of the canvas dimensions.
  - Iterates through all the tiles on the board, using the factory to expand the bounds for each tile.
  - Once the final bounds are determined, it creates a `Canvas` object of the correct size.
  - Creates a `TilePrinter` to handle the rendering of individual tiles.
  - Iterates through the tiles a second time, calling the `TilePrinter` to draw each tile onto the canvas.
  - Finally, it converts the `Canvas` to a string and returns the result.

### 2. `Canvas`

- **Responsibility:** Represents a 2D grid of characters. It provides a coordinate system for placing characters and handles the final rendering of the grid to a string.
- **Key Features:**
  - Can be initialized with both positive and negative coordinates for its bounds.
  - Provides `set` and `get` methods for manipulating individual characters on the grid.
  - The `toString()` method converts the entire grid into a single string, with each row separated by a newline character.

### 3. `TilePrinter`

- **Responsibility:** Knows how to draw a single `Tile` onto a `Canvas`.
- **Logic:**
  - Takes a `Canvas` object in its constructor.
  - The `print` method takes a `Tile` and the top-left coordinates where it should be drawn.
  - It then places the appropriate characters on the canvas to represent the tile's shape and terrain types.

### 4. `CanvasCoordinates`

- **Responsibility:** A utility class for converting `HexCoordinate` objects (from the `models` module) into canvas coordinates (`x`, `y`).
- **Logic:**
  - The `getTileCoordinates` method contains the mathematical formula for converting from the hexagonal grid system to the rectangular grid system of the canvas.

### 5. `CanvasBoundsFactory`

- **Responsibility:** A factory for creating and managing `CanvasBounds` objects. This encapsulates the logic for calculating the bounding box of the board.
- **Key Components:**
  - `ICanvasBoundsFactory`: An interface that defines the contract for the factories.
  - `UninitializedCanvasBoundsFactory`: The initial state of the factory. Its `stretch` method creates an `InitializedCanvasBoundsFactory` with the bounds of the first tile.
  - `InitializedCanvasBoundsFactory`: Represents the state of the factory after the first tile has been processed. Its `stretch` method expands the current bounds to include a new tile.
