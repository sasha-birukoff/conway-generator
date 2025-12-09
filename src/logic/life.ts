export type Grid = boolean[][];

export function createEmptyGrid(rows: number, cols: number): Grid {
  return Array(rows).fill(null).map(() => Array(cols).fill(false));
}

export function createRandomGrid(rows: number, cols: number, density: number): Grid {
  const grid = createEmptyGrid(rows, cols);
  const threshold = density / 100;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = Math.random() < threshold;
    }
  }
  return grid;
}

export type SymmetryType = 'horizontal' | 'vertical' | 'quad' | 'diagonal';

export function createSymmetricGrid(
  rows: number,
  cols: number,
  density: number,
  symmetry: SymmetryType = 'quad'
): Grid {
  const grid = createEmptyGrid(rows, cols);
  const threshold = density / 100;

  // Determine the region to randomize (then mirror)
  const halfRows = Math.ceil(rows / 2);
  const halfCols = Math.ceil(cols / 2);

  switch (symmetry) {
    case 'horizontal':
      // Mirror left-right
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < halfCols; c++) {
          const alive = Math.random() < threshold;
          grid[r][c] = alive;
          grid[r][cols - 1 - c] = alive;
        }
      }
      break;

    case 'vertical':
      // Mirror top-bottom
      for (let r = 0; r < halfRows; r++) {
        for (let c = 0; c < cols; c++) {
          const alive = Math.random() < threshold;
          grid[r][c] = alive;
          grid[rows - 1 - r][c] = alive;
        }
      }
      break;

    case 'quad':
      // Mirror both axes (4-way symmetry)
      for (let r = 0; r < halfRows; r++) {
        for (let c = 0; c < halfCols; c++) {
          const alive = Math.random() < threshold;
          grid[r][c] = alive;
          grid[r][cols - 1 - c] = alive;
          grid[rows - 1 - r][c] = alive;
          grid[rows - 1 - r][cols - 1 - c] = alive;
        }
      }
      break;

    case 'diagonal':
      // Mirror along main diagonal (works best on square grids)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= r && c < cols; c++) {
          const alive = Math.random() < threshold;
          grid[r][c] = alive;
          if (c < rows && r < cols) {
            grid[c][r] = alive;
          }
        }
      }
      break;
  }

  return grid;
}

export function copyGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

function countNeighbors(grid: Grid, row: number, col: number): number {
  const rows = grid.length;
  const cols = grid[0].length;
  let count = 0;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      // Toroidal wrapping - edges wrap around
      const r = (row + dr + rows) % rows;
      const c = (col + dc + cols) % cols;
      if (grid[r][c]) {
        count++;
      }
    }
  }

  return count;
}

export function stepConway(grid: Grid): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createEmptyGrid(rows, cols);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const neighbors = countNeighbors(grid, r, c);
      const alive = grid[r][c];

      if (alive && (neighbors === 2 || neighbors === 3)) {
        newGrid[r][c] = true;
      } else if (!alive && neighbors === 3) {
        newGrid[r][c] = true;
      } else {
        newGrid[r][c] = false;
      }
    }
  }

  return newGrid;
}

export function toggleCell(grid: Grid, row: number, col: number): Grid {
  const newGrid = copyGrid(grid);
  newGrid[row][col] = !newGrid[row][col];
  return newGrid;
}
