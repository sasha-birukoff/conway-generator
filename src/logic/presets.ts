import { Grid } from './life';

export interface Preset {
  name: string;
  rows: number;
  cols: number;
  grid: Grid;
}

const GLIDER: Preset = {
  name: 'Glider',
  rows: 5,
  cols: 5,
  grid: [
    [false, false, false, false, false],
    [false, false, true, false, false],
    [false, false, false, true, false],
    [false, true, true, true, false],
    [false, false, false, false, false],
  ],
};

export const PRESETS: Preset[] = [GLIDER];
