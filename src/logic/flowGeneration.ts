import { Grid } from './life';

// Flow direction types
export type FlowDirection =
  | 'horizontal'
  | 'vertical'
  | 'diagonal-up'
  | 'diagonal-down'
  | 'radial-out'
  | 'radial-in'
  | 's-curve'
  | 'wave';

// Generation method types
export type GenerationMethod = 'carve' | 'vector' | 'rhythm';

// Symmetry types for flow
export type FlowSymmetry = 'none' | 'horizontal' | 'vertical' | '4way' | 'diagonal';

export interface FlowOptions {
  rows: number;
  cols: number;
  direction: FlowDirection;
  intensity: number; // 0-100, how strong the directional pull is
  fillAmount: number; // 0-100, percentage of cells filled
  symmetry: FlowSymmetry;
  method: GenerationMethod;
}

// Utility: Create empty grid
function createGrid(rows: number, cols: number, fill: boolean): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

// Utility: Clamp value
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Utility: Distance from point to line/curve
function distanceToFlowLine(
  row: number,
  col: number,
  rows: number,
  cols: number,
  direction: FlowDirection,
  phase: number = 0
): number {
  const normalizedRow = row / (rows - 1 || 1);
  const normalizedCol = col / (cols - 1 || 1);
  const centerRow = 0.5;
  const centerCol = 0.5;

  switch (direction) {
    case 'horizontal': {
      // Flow line is horizontal through center
      return Math.abs(normalizedRow - centerRow);
    }
    case 'vertical': {
      // Flow line is vertical through center
      return Math.abs(normalizedCol - centerCol);
    }
    case 'diagonal-up': {
      // Flow line is diagonal from bottom-left to top-right
      const expectedRow = 1 - normalizedCol;
      return Math.abs(normalizedRow - expectedRow) / Math.sqrt(2);
    }
    case 'diagonal-down': {
      // Flow line is diagonal from top-left to bottom-right
      return Math.abs(normalizedRow - normalizedCol) / Math.sqrt(2);
    }
    case 'radial-out':
    case 'radial-in': {
      // Distance from center
      const dx = normalizedCol - centerCol;
      const dy = normalizedRow - centerRow;
      return Math.sqrt(dx * dx + dy * dy);
    }
    case 's-curve': {
      // S-curve flowing horizontally
      const expectedRow = centerRow + 0.3 * Math.sin(normalizedCol * Math.PI * 2 + phase);
      return Math.abs(normalizedRow - expectedRow);
    }
    case 'wave': {
      // Multiple wave lines
      const waveY = centerRow + 0.25 * Math.sin(normalizedCol * Math.PI * 3 + phase);
      return Math.abs(normalizedRow - waveY);
    }
    default:
      return 0.5;
  }
}

// Get flow value at a point (0 = on flow line, 1 = far from flow line)
function getFlowValue(
  row: number,
  col: number,
  rows: number,
  cols: number,
  direction: FlowDirection,
  intensity: number
): number {
  const distance = distanceToFlowLine(row, col, rows, cols, direction);
  // Intensity affects how quickly the flow value falls off
  const falloff = 0.1 + (1 - intensity / 100) * 0.9;
  return Math.min(1, distance / falloff);
}

// CARVE METHOD: Start filled, remove along flow lines
function generateCarve(options: FlowOptions): Grid {
  const { rows, cols, direction, intensity, fillAmount } = options;
  const grid = createGrid(rows, cols, true);

  // Calculate how many cells to remove
  const totalCells = rows * cols;
  const targetFilled = Math.round(totalCells * (fillAmount / 100));
  const toRemove = totalCells - targetFilled;

  // Create array of cells with their flow values
  const cells: { row: number; col: number; flowValue: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const flowValue = getFlowValue(r, c, rows, cols, direction, intensity);
      // Add some randomness but weight by flow
      const noise = (Math.random() - 0.5) * (1 - intensity / 100) * 0.5;
      cells.push({ row: r, col: c, flowValue: flowValue + noise });
    }
  }

  // Sort by flow value - cells ON the flow line have lower values
  // For carve, we remove cells NEAR the flow line to create rivers
  cells.sort((a, b) => a.flowValue - b.flowValue);

  // Remove cells along flow lines (creates negative space rivers)
  for (let i = 0; i < toRemove && i < cells.length; i++) {
    const cell = cells[i];
    grid[cell.row][cell.col] = false;
  }

  return grid;
}

// VECTOR METHOD: Place cells along flow lines
function generateVector(options: FlowOptions): Grid {
  const { rows, cols, direction, intensity, fillAmount } = options;
  const grid = createGrid(rows, cols, false);

  // Calculate how many cells to place
  const totalCells = rows * cols;
  const targetFilled = Math.round(totalCells * (fillAmount / 100));

  // Create array of cells with their flow values
  const cells: { row: number; col: number; flowValue: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const flowValue = getFlowValue(r, c, rows, cols, direction, intensity);
      // Invert flow value - cells ON the flow line should be placed first
      const noise = (Math.random() - 0.5) * (1 - intensity / 100) * 0.5;
      cells.push({ row: r, col: c, flowValue: flowValue + noise });
    }
  }

  // Sort by flow value - cells ON the flow line have lower values
  cells.sort((a, b) => a.flowValue - b.flowValue);

  // Place cells along flow lines
  for (let i = 0; i < targetFilled && i < cells.length; i++) {
    const cell = cells[i];
    grid[cell.row][cell.col] = true;
  }

  return grid;
}

// RHYTHM METHOD: Create patterns with intentional breaks
function generateRhythm(options: FlowOptions): Grid {
  const { rows, cols, direction, intensity, fillAmount } = options;
  const grid = createGrid(rows, cols, false);

  // Rhythm parameters based on intensity
  const beatLength = Math.max(2, Math.round(4 - intensity / 33)); // 2-4 cells
  const restLength = Math.max(1, Math.round(3 - intensity / 50)); // 1-3 cells
  const cycleLength = beatLength + restLength;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Get position along flow direction
      let flowPosition: number;
      const normalizedRow = r / (rows - 1 || 1);
      const normalizedCol = c / (cols - 1 || 1);

      switch (direction) {
        case 'horizontal':
          flowPosition = c;
          break;
        case 'vertical':
          flowPosition = r;
          break;
        case 'diagonal-up':
          flowPosition = c + (rows - 1 - r);
          break;
        case 'diagonal-down':
          flowPosition = c + r;
          break;
        case 'radial-out':
        case 'radial-in': {
          const dx = c - cols / 2;
          const dy = r - rows / 2;
          flowPosition = Math.sqrt(dx * dx + dy * dy);
          break;
        }
        case 's-curve':
        case 'wave':
          flowPosition = c + Math.sin(r / rows * Math.PI * 2) * 2;
          break;
        default:
          flowPosition = c;
      }

      // Add row-based phase shift for visual interest
      const phaseShift = r * (intensity / 100) * 2;
      const positionInCycle = (flowPosition + phaseShift) % cycleLength;

      // Determine if this is a "beat" or "rest"
      const isBeat = positionInCycle < beatLength;

      // Apply fill amount as probability within beats
      if (isBeat) {
        const probability = fillAmount / 100;
        // Higher probability near flow lines
        const flowValue = getFlowValue(r, c, rows, cols, direction, intensity);
        const adjustedProb = probability * (1 - flowValue * 0.5);
        grid[r][c] = Math.random() < adjustedProb;
      }
    }
  }

  return grid;
}

// Apply symmetry to a grid
function applySymmetry(grid: Grid, symmetry: FlowSymmetry): Grid {
  const rows = grid.length;
  const cols = grid[0].length;
  const result = createGrid(rows, cols, false);

  if (symmetry === 'none') {
    return grid.map(row => [...row]);
  }

  const halfRows = Math.ceil(rows / 2);
  const halfCols = Math.ceil(cols / 2);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let sourceR = r;
      let sourceC = c;

      switch (symmetry) {
        case 'horizontal':
          // Mirror left-right
          sourceC = c < halfCols ? c : cols - 1 - c;
          result[r][c] = grid[sourceR][sourceC];
          break;

        case 'vertical':
          // Mirror top-bottom
          sourceR = r < halfRows ? r : rows - 1 - r;
          result[r][c] = grid[sourceR][sourceC];
          break;

        case '4way':
          // Mirror both axes
          sourceR = r < halfRows ? r : rows - 1 - r;
          sourceC = c < halfCols ? c : cols - 1 - c;
          result[r][c] = grid[sourceR][sourceC];
          break;

        case 'diagonal':
          // Mirror across main diagonal
          if (r <= c) {
            result[r][c] = grid[r][c];
          } else {
            result[r][c] = grid[c][r];
          }
          break;
      }
    }
  }

  return result;
}

// Main generation function
export function generateFlowPattern(options: FlowOptions): Grid {
  let grid: Grid;

  // Generate base pattern based on method
  switch (options.method) {
    case 'carve':
      grid = generateCarve(options);
      break;
    case 'vector':
      grid = generateVector(options);
      break;
    case 'rhythm':
      grid = generateRhythm(options);
      break;
    default:
      grid = generateVector(options);
  }

  // Apply symmetry if needed
  if (options.symmetry !== 'none') {
    grid = applySymmetry(grid, options.symmetry);
  }

  return grid;
}

// Preset flow configurations for quick access
export interface FlowPreset {
  name: string;
  method: GenerationMethod;
  direction: FlowDirection;
  intensity: number;
  fillAmount: number;
  symmetry: FlowSymmetry;
}

export const FLOW_PRESETS: FlowPreset[] = [
  {
    name: 'River',
    method: 'carve',
    direction: 's-curve',
    intensity: 70,
    fillAmount: 75,
    symmetry: 'none',
  },
  {
    name: 'Drift',
    method: 'vector',
    direction: 'diagonal-up',
    intensity: 60,
    fillAmount: 35,
    symmetry: 'none',
  },
  {
    name: 'Pulse',
    method: 'rhythm',
    direction: 'horizontal',
    intensity: 80,
    fillAmount: 50,
    symmetry: 'vertical',
  },
  {
    name: 'Radiate',
    method: 'vector',
    direction: 'radial-out',
    intensity: 75,
    fillAmount: 40,
    symmetry: '4way',
  },
  {
    name: 'Cascade',
    method: 'carve',
    direction: 'diagonal-down',
    intensity: 65,
    fillAmount: 70,
    symmetry: 'diagonal',
  },
  {
    name: 'Tide',
    method: 'carve',
    direction: 'wave',
    intensity: 70,
    fillAmount: 65,
    symmetry: 'horizontal',
  },
  {
    name: 'Scatter',
    method: 'vector',
    direction: 'radial-in',
    intensity: 40,
    fillAmount: 30,
    symmetry: 'none',
  },
  {
    name: 'Beat',
    method: 'rhythm',
    direction: 'vertical',
    intensity: 85,
    fillAmount: 55,
    symmetry: 'horizontal',
  },
];
