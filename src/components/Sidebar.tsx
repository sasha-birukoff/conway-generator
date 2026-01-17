import React, { useState, useEffect } from 'react';
import { PRESETS } from '../logic/presets';
import { SymmetryType } from '../logic/life';

interface SidebarProps {
  // Grid settings
  rows: number;
  onRowsChange: (rows: number) => void;
  cols: number;
  onColsChange: (cols: number) => void;

  // Colors
  aliveColor: string;
  onAliveColorChange: (color: string) => void;
  deadColor: string;
  onDeadColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;

  // Settings
  cellGap: number;
  onCellGapChange: (gap: number) => void;
  randomDensity: number;
  onRandomDensityChange: (density: number) => void;
  longSidePx: number;
  onLongSidePxChange: (px: number) => void;
  infiniteCanvasMode: boolean;
  onInfiniteCanvasModeChange: (enabled: boolean) => void;

  // Playback
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSymmetricReset: (symmetry: SymmetryType) => void;
  onClear: () => void;
  onPresetSelect: (presetIndex: number) => void;
  mode: 'edit' | 'sim';

  // Timeline/Frames
  generation: number;
  frames: any[];
  currentFrameIndex: number;
  onFrameIndexChange: (index: number) => void;
  startFrame: number;
  onStartFrameChange: (frame: number) => void;
  endFrame: number;
  onEndFrameChange: (frame: number) => void;
  onExportSvg: () => void;
  onExportGif: () => void;
  isExporting: boolean;
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

export const Sidebar: React.FC<SidebarProps> = ({
  rows,
  onRowsChange,
  cols,
  onColsChange,
  aliveColor,
  onAliveColorChange,
  deadColor,
  onDeadColorChange,
  backgroundColor,
  onBackgroundColorChange,
  cellGap,
  onCellGapChange,
  randomDensity,
  onRandomDensityChange,
  longSidePx,
  onLongSidePxChange,
  infiniteCanvasMode,
  onInfiniteCanvasModeChange,
  isPlaying,
  onPlayPause,
  onReset,
  onSymmetricReset,
  onClear,
  onPresetSelect,
  mode,
  generation,
  frames,
  currentFrameIndex,
  onFrameIndexChange,
  startFrame,
  onStartFrameChange,
  endFrame,
  onEndFrameChange,
  onExportSvg,
  onExportGif,
  isExporting,
}) => {
  const colsInput = useNumberInput(cols, onColsChange, 1, 30);
  const rowsInput = useNumberInput(rows, onRowsChange, 1, 30);
  const [symmetryType, setSymmetryType] = useState<SymmetryType>('quad');

  const hasFrames = frames.length > 0;
  const maxFrame = frames.length - 1;

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <img src="/logo.svg" alt="Conway" className="sidebar-logo" />
        <span className="sidebar-title">Conway Asset Generator</span>
      </div>

      {/* Scrollable Content */}
      <div className="sidebar-content">
        {/* Colors Section */}
        <section className="panel-section">
          <h2 className="section-title">Colors</h2>
          <div className="colors-row">
            <div className="color-item">
              <span className="color-label">Alive</span>
              <input
                type="color"
                value={aliveColor}
                onChange={(e) => onAliveColorChange(e.target.value)}
              />
            </div>
            <div className="color-item">
              <span className="color-label">Dead</span>
              <input
                type="color"
                value={deadColor}
                onChange={(e) => onDeadColorChange(e.target.value)}
              />
            </div>
            <div className="color-item">
              <span className="color-label">Background</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Grid Settings Section */}
        <section className="panel-section">
          <h2 className="section-title">Grid</h2>

          <div className="grid-size-row">
            <div className="grid-size-item">
              <label>Width</label>
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
            </div>
            <div className="grid-size-item">
              <label>Height</label>
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
            </div>
          </div>

          <div className="control-group">
            <div className="slider-row">
              <span className="control-label">Cell Gap</span>
              <span className="value-pill">{cellGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={cellGap}
              onChange={(e) => onCellGapChange(parseInt(e.target.value))}
            />
          </div>

          <div className="control-group">
            <div className="slider-row">
              <span className="control-label">Density</span>
              <span className="value-pill">{randomDensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={randomDensity}
              onChange={(e) => onRandomDensityChange(parseInt(e.target.value))}
            />
          </div>

          <div className="control-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={infiniteCanvasMode}
                onChange={(e) => onInfiniteCanvasModeChange(e.target.checked)}
                disabled={mode === 'sim'}
              />
              Infinite Canvas Mode
            </label>
          </div>
        </section>

        {/* Presets Section */}
        <section className="panel-section">
          <h2 className="section-title">Presets</h2>
          <div className="presets-grid">
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
        </section>

        {/* Playback Section */}
        <section className="panel-section">
          <h2 className="section-title">Playback</h2>
          <div className="playback-row">
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
        </section>

        {/* Symmetry Section */}
        <section className="panel-section">
          <h2 className="section-title">Symmetry</h2>
          <div className="symmetry-row">
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
        </section>

        {/* Frame Controls Section */}
        <section className="panel-section frame-section">
          <h2 className="section-title">Timeline</h2>

          <div className="generation-badge">
            Generation: {generation}
          </div>

          {hasFrames ? (
            <>
              <div className="control-group">
                <div className="slider-row">
                  <span className="control-label">Frame</span>
                  <span className="value-pill">{currentFrameIndex} / {maxFrame}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxFrame}
                  value={currentFrameIndex}
                  onChange={(e) => onFrameIndexChange(parseInt(e.target.value))}
                />
              </div>

              <div className="frame-inputs-row">
                <div className="frame-input-item">
                  <label>Start Frame</label>
                  <input
                    type="number"
                    min="0"
                    max={maxFrame}
                    value={startFrame}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(maxFrame, parseInt(e.target.value) || 0));
                      onStartFrameChange(val);
                    }}
                  />
                </div>
                <div className="frame-input-item">
                  <label>End Frame</label>
                  <input
                    type="number"
                    min="0"
                    max={maxFrame}
                    value={endFrame}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(maxFrame, parseInt(e.target.value) || maxFrame));
                      onEndFrameChange(val);
                    }}
                  />
                </div>
              </div>

              <div className="control-group">
                <div className="slider-row">
                  <span className="control-label">Export Size</span>
                  <span className="value-pill">{longSidePx}px</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={longSidePx}
                  onChange={(e) => onLongSidePxChange(parseInt(e.target.value))}
                />
              </div>
            </>
          ) : (
            <p className="no-frames-text">Press Play to start simulation and record frames.</p>
          )}
        </section>
      </div>

      {/* Footer with Export Buttons */}
      <div className="sidebar-footer">
        <div className="export-buttons">
          <button
            onClick={onExportGif}
            disabled={isExporting || !hasFrames || startFrame > endFrame}
            className="btn-export"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M8 10L4.5 6.5M8 10l3.5-3.5M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isExporting ? 'Exporting...' : 'Export GIF'}
          </button>
          <button
            onClick={onExportSvg}
            disabled={isExporting || !hasFrames || startFrame > endFrame}
            className="btn-export-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v9M8 10L4.5 6.5M8 10l3.5-3.5M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {isExporting ? 'Exporting...' : 'Export SVG ZIP'}
          </button>
        </div>
      </div>
    </aside>
  );
};
