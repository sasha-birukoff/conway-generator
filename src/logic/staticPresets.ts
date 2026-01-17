import { Grid } from './life';

export interface StaticPreset {
  name: string;
  rows: number;
  cols: number;
  grid: Grid;
}

// Helper to create grid from string pattern
function parsePattern(pattern: string): Grid {
  return pattern
    .trim()
    .split('\n')
    .map(row => row.split('').map(c => c === '█'));
}

export const STATIC_PRESETS: StaticPreset[] = [
  {
    name: 'Glider',
    rows: 5,
    cols: 5,
    grid: parsePattern(`
·█···
··█··
███··
·····
·····
`.trim()),
  },
  {
    name: 'Pulsar',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
··█·█··
·█···█·
··█·█··
·······
··█·█··
·█···█·
··█·█··
`.trim()),
  },
  {
    name: 'Diamond',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
···█···
··█·█··
·█···█·
█·····█
·█···█·
··█·█··
···█···
`.trim()),
  },
  {
    name: 'Cross',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
···█···
···█···
···█···
███████
···█···
···█···
···█···
`.trim()),
  },
  {
    name: 'Diagonal',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
█·····█
·█···█·
··█·█··
···█···
··█·█··
·█···█·
█·····█
`.trim()),
  },
  {
    name: 'Cluster',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
·█···█·
██···██
·█···█·
·······
·█···█·
██···██
·█···█·
`.trim()),
  },
  {
    name: 'Constellation',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
█··█··█
·······
·█···█·
···█···
·█···█·
·······
█··█··█
`.trim()),
  },
  {
    name: 'Arrow',
    rows: 7,
    cols: 7,
    grid: parsePattern(`
···█···
··███··
·██·██·
███·███
·······
·······
·······
`.trim()),
  },
];

// Symmetric generation functions
export function generateSymmetricHorizontal(rows: number, cols: number, density: number): Grid {
  const grid: Grid = [];
  const halfCols = Math.ceil(cols / 2);

  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < halfCols; c++) {
      row.push(Math.random() * 100 < density);
    }
    // Mirror horizontally
    const fullRow: boolean[] = [...row];
    for (let c = halfCols - 1 - (cols % 2 === 0 ? 0 : 1); c >= 0; c--) {
      fullRow.push(row[c]);
    }
    grid.push(fullRow.slice(0, cols));
  }
  return grid;
}

export function generateSymmetricVertical(rows: number, cols: number, density: number): Grid {
  const grid: Grid = [];
  const halfRows = Math.ceil(rows / 2);

  // Generate top half
  for (let r = 0; r < halfRows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(Math.random() * 100 < density);
    }
    grid.push(row);
  }

  // Mirror vertically
  for (let r = halfRows - 1 - (rows % 2 === 0 ? 0 : 1); r >= 0; r--) {
    grid.push([...grid[r]]);
  }

  return grid.slice(0, rows);
}

export function generateSymmetric4Way(rows: number, cols: number, density: number): Grid {
  const grid: Grid = [];
  const halfRows = Math.ceil(rows / 2);
  const halfCols = Math.ceil(cols / 2);

  // Generate top-left quadrant
  const quadrant: Grid = [];
  for (let r = 0; r < halfRows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < halfCols; c++) {
      row.push(Math.random() * 100 < density);
    }
    quadrant.push(row);
  }

  // Build full grid with 4-way symmetry
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      // Map to quadrant coordinates
      const qr = r < halfRows ? r : rows - 1 - r;
      const qc = c < halfCols ? c : cols - 1 - c;
      row.push(quadrant[qr]?.[qc] ?? false);
    }
    grid.push(row);
  }

  return grid;
}

export function generateSymmetricDiagonal(rows: number, cols: number, density: number): Grid {
  const size = Math.max(rows, cols);
  const grid: Grid = [];

  // Generate upper triangle
  const triangle: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = r; c < size; c++) {
      row.push(Math.random() * 100 < density);
    }
    triangle.push(row);
  }

  // Build full grid with diagonal symmetry
  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      if (r <= c) {
        row.push(triangle[r]?.[c - r] ?? false);
      } else {
        row.push(triangle[c]?.[r - c] ?? false);
      }
    }
    grid.push(row);
  }

  return grid;
}

export function shuffleWithSymmetry(
  grid: Grid,
  symmetryType: 'horizontal' | 'vertical' | '4way' | 'diagonal',
  density: number
): Grid {
  const rows = grid.length;
  const cols = grid[0].length;

  switch (symmetryType) {
    case 'horizontal':
      return generateSymmetricHorizontal(rows, cols, density);
    case 'vertical':
      return generateSymmetricVertical(rows, cols, density);
    case '4way':
      return generateSymmetric4Way(rows, cols, density);
    case 'diagonal':
      return generateSymmetricDiagonal(rows, cols, density);
    default:
      return generateSymmetric4Way(rows, cols, density);
  }
}
