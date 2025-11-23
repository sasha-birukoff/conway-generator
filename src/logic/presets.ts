import { Grid } from './life';

export interface Preset {
  name: string;
  rows: number;
  cols: number;
  grid: Grid;
}

const GLIDER: Preset = {
  name: 'Glider',
  rows: 3,
  cols: 3,
  grid: [
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ],
};

const PULSAR: Preset = {
  name: 'Pulsar',
  rows: 13,
  cols: 13,
  grid: [
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [true, false, false, false, true, false, false, false, true, false, false, false, true],
    [false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, false, false, false, true, true, true, false, false],
  ],
};

const SPIDER: Preset = {
  name: 'Spider',
  rows: 12,
  cols: 12,
  grid: [
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, false, false, false, false, false, true, false, false, false],
    [false, false, true, true, false, false, false, true, true, false, false, false],
    [false, false, false, true, false, false, false, true, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, true, true, false, false, false, false, false],
    [false, false, false, false, false, true, true, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, false, false, false, false, false, true, false, false, false],
    [false, false, true, true, false, false, false, true, true, false, false, false],
    [false, false, false, true, false, false, false, true, false, false, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false],
  ],
};

export const PRESETS: Preset[] = [GLIDER, PULSAR, SPIDER];
