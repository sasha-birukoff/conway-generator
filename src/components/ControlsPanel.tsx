import React, { useState, useEffect } from 'react';
import { PRESETS } from '../logic/presets';
import { STATIC_PRESETS } from '../logic/staticPresets';
import { SymmetryType } from '../logic/life';
import { AppMode } from './ModeToggle';
import {
  FlowDirection,
  GenerationMethod,
  FlowSymmetry,
  FLOW_PRESETS,
} from '../logic/flowGeneration';

interface ControlsPanelProps {
  appMode: AppMode;
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
  onStaticPresetSelect: (presetIndex: number) => void;
  onShuffle: () => void;
  mode: 'edit' | 'sim';

  // Flow generation (static mode)
  flowDirection: FlowDirection;
  onFlowDirectionChange: (direction: FlowDirection) => void;
  flowIntensity: number;
  onFlowIntensityChange: (intensity: number) => void;
  flowSymmetry: FlowSymmetry;
  onFlowSymmetryChange: (symmetry: FlowSymmetry) => void;
  generationMethod: GenerationMethod;
  onGenerationMethodChange: (method: GenerationMethod) => void;
  fillAmount: number;
  onFillAmountChange: (amount: number) => void;
  onGenerate: () => void;
  onFlowPresetSelect: (presetIndex: number) => void;

  // Static mode export
  onExportSvg: () => void;
  onExportPng: () => void;
  onCopySvg: () => void;
  isCopied: boolean;
}

// Custom hook for number input with Figma-like behavior
function useNumberInput(value: number, onChange: (val: number) => void, min: number, max: number) {
  const [inputValue, setInputValue] = useState(String(value));
  const lastValidValue = React.useRef(value);

  useEffect(() => {
    setInputValue(String(value));
    lastValidValue.current = value;
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseInt(newValue);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
      lastValidValue.current = parsed;
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || parsed < min || parsed > max) {
      setInputValue(String(lastValidValue.current));
    } else {
      setInputValue(String(parsed));
      onChange(parsed);
      lastValidValue.current = parsed;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return { inputValue, handleChange, handleBlur, handleFocus };
}

const SYMMETRY_OPTIONS: { value: SymmetryType; label: string }[] = [
  { value: 'quad', label: '4-Way' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'diagonal', label: 'Diagonal' },
];

// Flow direction options with visual representations
const FLOW_DIRECTION_OPTIONS: { value: FlowDirection; label: string; icon: string }[] = [
  { value: 'horizontal', label: 'Horizontal', icon: '→' },
  { value: 'vertical', label: 'Vertical', icon: '↓' },
  { value: 'diagonal-up', label: 'Diagonal Up', icon: '↗' },
  { value: 'diagonal-down', label: 'Diagonal Down', icon: '↘' },
  { value: 'radial-out', label: 'Radial Out', icon: '⊕' },
  { value: 'radial-in', label: 'Radial In', icon: '⊙' },
  { value: 's-curve', label: 'S-Curve', icon: '∿' },
  { value: 'wave', label: 'Wave', icon: '〰' },
];

const FLOW_SYMMETRY_OPTIONS: { value: FlowSymmetry; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: '4way', label: '4-Way' },
  { value: 'diagonal', label: 'Diagonal' },
];

const METHOD_OPTIONS: { value: GenerationMethod; label: string; description: string }[] = [
  { value: 'carve', label: 'Carve', description: 'Start filled, carve negative space' },
  { value: 'vector', label: 'Vector', description: 'Place cells along flow lines' },
  { value: 'rhythm', label: 'Rhythm', description: 'Patterned beats with rests' },
];

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  appMode,
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
  onStaticPresetSelect,
  onShuffle,
  mode,
  flowDirection,
  onFlowDirectionChange,
  flowIntensity,
  onFlowIntensityChange,
  flowSymmetry,
  onFlowSymmetryChange,
  generationMethod,
  onGenerationMethodChange,
  fillAmount,
  onFillAmountChange,
  onGenerate,
  onFlowPresetSelect,
  onExportSvg,
  onExportPng,
  onCopySvg,
  isCopied,
}) => {
  const colsInput = useNumberInput(cols, onColsChange, 1, 30);
  const rowsInput = useNumberInput(rows, onRowsChange, 1, 30);
  const [symmetryType, setSymmetryType] = useState<SymmetryType>('quad');

  // Get suggested fill range based on method
  const getFillRange = () => {
    switch (generationMethod) {
      case 'carve':
        return { min: 50, max: 90, label: 'Fill (carve removes)' };
      case 'vector':
        return { min: 15, max: 50, label: 'Fill (along flow)' };
      case 'rhythm':
        return { min: 30, max: 70, label: 'Fill (in beats)' };
      default:
        return { min: 20, max: 80, label: 'Fill Amount' };
    }
  };

  const fillRange = getFillRange();

  // STATIC MODE
  if (appMode === 'static') {
    return (
      <div className="controls-panel">
        {/* Flow Presets */}
        <h3>Flow Presets</h3>
        <div className="flow-presets-grid">
          {FLOW_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onFlowPresetSelect(idx)}
              className="preset-btn flow-preset-btn"
              title={`${preset.method} + ${preset.direction}`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Generation Method */}
        <h3>Method</h3>
        <div className="method-buttons">
          {METHOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onGenerationMethodChange(opt.value)}
              className={`method-btn ${generationMethod === opt.value ? 'active' : ''}`}
              title={opt.description}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Flow Direction */}
        <h3>Flow Direction</h3>
        <div className="flow-direction-grid">
          {FLOW_DIRECTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFlowDirectionChange(opt.value)}
              className={`flow-direction-btn ${flowDirection === opt.value ? 'active' : ''}`}
              title={opt.label}
            >
              <span className="flow-icon">{opt.icon}</span>
            </button>
          ))}
        </div>

        {/* Flow Intensity */}
        <div className="control-group">
          <div className="slider-row">
            <span className="slider-label">Flow Intensity</span>
            <span className="value-display">{flowIntensity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={flowIntensity}
            onChange={(e) => onFlowIntensityChange(parseInt(e.target.value))}
          />
          <div className="slider-hints">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Fill Amount */}
        <div className="control-group">
          <div className="slider-row">
            <span className="slider-label">{fillRange.label}</span>
            <span className="value-display">{fillAmount}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="95"
            value={fillAmount}
            onChange={(e) => onFillAmountChange(parseInt(e.target.value))}
          />
          <div className="slider-hints">
            <span>Sparse</span>
            <span>Dense</span>
          </div>
        </div>

        {/* Symmetry */}
        <div className="control-group">
          <span className="slider-label">Symmetry</span>
          <div className="symmetry-select-group">
            {FLOW_SYMMETRY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onFlowSymmetryChange(opt.value)}
                className={`symmetry-btn ${flowSymmetry === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="control-group buttons" style={{ marginTop: '12px' }}>
          <button onClick={onGenerate} className="btn-generate">
            Generate
          </button>
          <button onClick={onShuffle} className="btn-shuffle">
            Shuffle
          </button>
        </div>

        {/* Quick Actions */}
        <div className="control-group buttons">
          <button onClick={onClear} className="btn-secondary" style={{ gridColumn: 'span 2' }}>
            Clear All
          </button>
        </div>

        {/* Classic Presets (collapsed) */}
        <details className="classic-presets">
          <summary>Classic Presets</summary>
          <div className="presets-grid-static">
            {STATIC_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onStaticPresetSelect(idx)}
                className="preset-btn"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </details>

        {/* Export */}
        <div className="export-group">
          <h3 className="section-title" style={{ marginTop: 0 }}>Export</h3>
          <button onClick={onExportSvg} className="btn-export">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M8 10L4.5 6.5M8 10l3.5-3.5M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export SVG
          </button>
          <div className="export-row">
            <button onClick={onExportPng} className="btn-export-secondary">
              Export PNG
            </button>
            <button
              onClick={onCopySvg}
              className={`btn-copy ${isCopied ? 'copied' : ''}`}
            >
              {isCopied ? 'Copied!' : 'Copy SVG'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ANIMATED MODE
  return (
    <div className="controls-panel">
      {/* Grid Size */}
      <h3>Grid Size</h3>
      <div className="control-group row-cols-group">
        <label>
          Width
          <input
            type="number"
            min="1"
            max="30"
            value={colsInput.inputValue}
            onChange={colsInput.handleChange}
            onBlur={colsInput.handleBlur}
            onFocus={colsInput.handleFocus}
            disabled={mode === 'sim'}
          />
        </label>
        <label>
          Height
          <input
            type="number"
            min="1"
            max="30"
            value={rowsInput.inputValue}
            onChange={rowsInput.handleChange}
            onBlur={rowsInput.handleBlur}
            onFocus={rowsInput.handleFocus}
            disabled={mode === 'sim'}
          />
        </label>
      </div>

      {/* Presets */}
      <h3>Presets</h3>
      <div className="control-group">
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

      {/* Playback Controls */}
      <div className="control-group buttons">
        <button onClick={onPlayPause} className="btn-primary">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={onReset} className="btn-secondary">
          Reset
        </button>
        <button onClick={onClear} className="btn-secondary">
          Clear
        </button>
      </div>

      {/* Symmetry */}
      <div className="control-group symmetric-group">
        <h3 style={{ marginTop: 0 }}>Symmetry</h3>
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
