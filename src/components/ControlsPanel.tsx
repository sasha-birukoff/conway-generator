import React from 'react';
import { PRESETS } from '../logic/presets';

interface ControlsPanelProps {
  rows: number;
  onRowsChange: (rows: number) => void;
  cols: number;
  onColsChange: (cols: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
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
  isPlaying,
  onPlayPause,
  onReset,
  onClear,
  onPresetSelect,
  mode,
}) => {
  return (
    <div className="controls-panel">
      <h2>Controls</h2>

      <div className="control-group row-cols-group">
        <label>
          Width (1–30):
          <input
            type="number"
            min="1"
            max="30"
            value={cols}
            onChange={(e) => onColsChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
            disabled={mode === 'sim'}
          />
        </label>
        <label>
          Height (1–30):
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
        <button onClick={onReset} className="btn-primary">
          Reset
        </button>
        <button onClick={onClear} className="btn-primary">
          Clear
        </button>
      </div>
    </div>
  );
};
