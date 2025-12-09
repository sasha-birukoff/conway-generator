import React, { useState, useEffect } from 'react';
import { PRESETS } from '../logic/presets';
import { SymmetryType } from '../logic/life';

interface ControlsPanelProps {
  rows: number;
  onRowsChange: (rows: number) => void;
  cols: number;
  onColsChange: (cols: number) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSymmetricReset: (symmetry: SymmetryType) => void;
  onClear: () => void;
  onPresetSelect: (presetIndex: number) => void;
  mode: 'edit' | 'sim';
}

// Custom hook for number input with delayed validation
function useNumberInput(value: number, onChange: (val: number) => void, min: number, max: number) {
  const [inputValue, setInputValue] = useState(String(value));

  // Sync with external value changes (e.g., presets)
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseInt(newValue);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || parsed < min) {
      setInputValue(String(min));
      onChange(min);
    } else if (parsed > max) {
      setInputValue(String(max));
      onChange(max);
    } else {
      setInputValue(String(parsed));
      onChange(parsed);
    }
  };

  return { inputValue, handleChange, handleBlur };
}

const SYMMETRY_OPTIONS: { value: SymmetryType; label: string }[] = [
  { value: 'quad', label: '4-Way' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'diagonal', label: 'Diagonal' },
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  rows,
  onRowsChange,
  cols,
  onColsChange,
  isPlaying,
  onPlayPause,
  onReset,
  onSymmetricReset,
  onClear,
  onPresetSelect,
  mode,
}) => {
  const colsInput = useNumberInput(cols, onColsChange, 1, 30);
  const rowsInput = useNumberInput(rows, onRowsChange, 1, 30);
  const [symmetryType, setSymmetryType] = useState<SymmetryType>('quad');

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
            value={colsInput.inputValue}
            onChange={colsInput.handleChange}
            onBlur={colsInput.handleBlur}
            disabled={mode === 'sim'}
          />
        </label>
        <label>
          Height (1–30):
          <input
            type="number"
            min="1"
            max="30"
            value={rowsInput.inputValue}
            onChange={rowsInput.handleChange}
            onBlur={rowsInput.handleBlur}
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

      <div className="control-group symmetric-group">
        <h3>Symmetric Reset</h3>
        <div className="symmetric-controls">
          <select
            value={symmetryType}
            onChange={(e) => setSymmetryType(e.target.value as SymmetryType)}
            className="symmetry-select"
          >
            {SYMMETRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => onSymmetricReset(symmetryType)}
            className="btn-primary"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
