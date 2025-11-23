import React from 'react';
import { PRESETS } from '../logic/presets';

interface ControlsPanelProps {
  rows: number;
  onRowsChange: (rows: number) => void;
  cols: number;
  onColsChange: (cols: number) => void;
  gapFactor: number;
  onGapFactorChange: (gap: number) => void;
  aliveColor: string;
  onAliveColorChange: (color: string) => void;
  deadColor: string;
  onDeadColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  randomDensity: number;
  onRandomDensityChange: (density: number) => void;
  longSidePx: number;
  onLongSidePxChange: (px: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onClear: () => void;
  onPresetSelect: (presetIndex: number) => void;
  mode: 'edit' | 'sim';
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  rows,
  onRowsChange,
  cols,
  onColsChange,
  gapFactor,
  onGapFactorChange,
  aliveColor,
  onAliveColorChange,
  deadColor,
  onDeadColorChange,
  backgroundColor,
  onBackgroundColorChange,
  randomDensity,
  onRandomDensityChange,
  longSidePx,
  onLongSidePxChange,
  isPlaying,
  onPlayPause,
  onStep,
  onReset,
  onClear,
  onPresetSelect,
  mode,
}) => {
  return (
    <div className="controls-panel">
      <h2>Controls</h2>

      <div className="control-group">
        <label>
          Rows (1–30):
          <input
            type="number"
            min="1"
            max="30"
            value={rows}
            onChange={(e) => onRowsChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
            disabled={mode === 'sim'}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Cols (1–30):
          <input
            type="number"
            min="1"
            max="30"
            value={cols}
            onChange={(e) => onColsChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
            disabled={mode === 'sim'}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Gap Factor (0–1):
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={gapFactor}
            onChange={(e) => onGapFactorChange(parseFloat(e.target.value))}
          />
          <span>{gapFactor.toFixed(1)}</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Alive Color:
          <input
            type="color"
            value={aliveColor}
            onChange={(e) => onAliveColorChange(e.target.value)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Dead Color:
          <input
            type="color"
            value={deadColor}
            onChange={(e) => onDeadColorChange(e.target.value)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Background Color (preview only):
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Random Density (%):
          <input
            type="range"
            min="0"
            max="100"
            value={randomDensity}
            onChange={(e) => onRandomDensityChange(parseInt(e.target.value))}
          />
          <span>{randomDensity}%</span>
        </label>
      </div>

      <div className="control-group">
        <label>
          Long Side (px):
          <input
            type="number"
            min="100"
            max="5000"
            value={longSidePx}
            onChange={(e) => onLongSidePxChange(Math.max(100, parseInt(e.target.value) || 1000))}
          />
        </label>
      </div>

      <div className="control-group">
        <h3>Presets</h3>
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onPresetSelect(idx)}
            className="preset-btn"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="control-group buttons">
        <button onClick={onPlayPause} className="btn-primary">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={onStep} disabled={isPlaying} className="btn-secondary">
          Step
        </button>
        <button onClick={onReset} className="btn-secondary">
          Reset
        </button>
        <button onClick={onClear} className="btn-secondary">
          Clear
        </button>
      </div>
    </div>
  );
};
