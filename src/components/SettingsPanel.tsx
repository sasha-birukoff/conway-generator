import React from 'react';
import { ModeToggle, AppMode } from './ModeToggle';
import { CellShape } from './GridCanvas';

interface SettingsPanelProps {
  // Mode
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;

  // Colors
  aliveColor: string;
  onAliveColorChange: (color: string) => void;
  deadColor: string;
  onDeadColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;

  // Grid
  cellGap: number;
  onCellGapChange: (gap: number) => void;
  rows: number;
  onRowsChange: (rows: number) => void;
  cols: number;
  onColsChange: (cols: number) => void;

  // Static mode only
  cellShape: CellShape;
  onCellShapeChange: (shape: CellShape) => void;
  canvasSize: number;
  onCanvasSizeChange: (size: number) => void;

  // Animated mode only
  randomDensity: number;
  onRandomDensityChange: (density: number) => void;
  longSidePx: number;
  onLongSidePxChange: (px: number) => void;
  infiniteCanvasMode: boolean;
  onInfiniteCanvasModeChange: (enabled: boolean) => void;

  mode: 'edit' | 'sim';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  appMode,
  onAppModeChange,
  aliveColor,
  onAliveColorChange,
  deadColor,
  onDeadColorChange,
  backgroundColor,
  onBackgroundColorChange,
  cellGap,
  onCellGapChange,
  rows,
  onRowsChange,
  cols,
  onColsChange,
  cellShape,
  onCellShapeChange,
  canvasSize,
  onCanvasSizeChange,
  randomDensity,
  onRandomDensityChange,
  longSidePx,
  onLongSidePxChange,
  infiniteCanvasMode,
  onInfiniteCanvasModeChange,
  mode,
}) => {
  return (
    <div className="settings-panel">
      {/* Panel Header with Logo and Mode Toggle */}
      <div className="panel-header-with-toggle">
        <div className="panel-header-row">
          <img src="/logo.svg" alt="Conway" className="panel-logo" />
          <span className="panel-title">Conway</span>
        </div>
        <ModeToggle mode={appMode} onModeChange={onAppModeChange} />
      </div>

      {/* Colors */}
      <h3 className="section-title">Colors</h3>
      <div className="control-group colors-group">
        <label>
          <span className="color-label">Alive</span>
          <input
            type="color"
            value={aliveColor}
            onChange={(e) => onAliveColorChange(e.target.value)}
          />
        </label>
        <label>
          <span className="color-label">{appMode === 'static' ? 'Dead/BG' : 'Dead'}</span>
          <input
            type="color"
            value={deadColor}
            onChange={(e) => onDeadColorChange(e.target.value)}
          />
        </label>
        <label>
          <span className="color-label">Canvas</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
          />
        </label>
      </div>

      {/* Cell Gap */}
      <div className="control-group">
        <div className="slider-row">
          <span className="slider-label">Cell Gap</span>
          <span className="value-display">{cellGap}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          value={cellGap}
          onChange={(e) => onCellGapChange(parseInt(e.target.value))}
        />
      </div>

      {/* Grid Size - Static mode only shows in settings */}
      {appMode === 'static' && (
        <>
          <div className="control-group row-cols-group">
            <label>
              Width
              <input
                type="number"
                min="1"
                max="30"
                value={cols}
                onChange={(e) => onColsChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              />
            </label>
            <label>
              Height
              <input
                type="number"
                min="1"
                max="30"
                value={rows}
                onChange={(e) => onRowsChange(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
              />
            </label>
          </div>

          {/* Cell Shape */}
          <div className="control-group">
            <span className="slider-label">Cell Shape</span>
            <div className="shape-select-group">
              <button
                className={`shape-btn ${cellShape === 'square' ? 'active' : ''}`}
                onClick={() => onCellShapeChange('square')}
                title="Square"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <rect x="3" y="3" width="14" height="14" />
                </svg>
              </button>
              <button
                className={`shape-btn ${cellShape === 'circle' ? 'active' : ''}`}
                onClick={() => onCellShapeChange('circle')}
                title="Circle"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <circle cx="10" cy="10" r="7" />
                </svg>
              </button>
              <button
                className={`shape-btn ${cellShape === 'rounded' ? 'active' : ''}`}
                onClick={() => onCellShapeChange('rounded')}
                title="Rounded"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <rect x="3" y="3" width="14" height="14" rx="4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Canvas Size */}
          <div className="control-group">
            <div className="slider-row">
              <span className="slider-label">Canvas Size</span>
              <span className="value-display">{canvasSize}px</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={canvasSize}
              onChange={(e) => onCanvasSizeChange(parseInt(e.target.value))}
            />
          </div>
        </>
      )}

      {/* Animated mode only controls */}
      {appMode === 'animated' && (
        <>
          {/* Density */}
          <div className="control-group">
            <div className="slider-row">
              <span className="slider-label">Density</span>
              <span className="value-display">{randomDensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={randomDensity}
              onChange={(e) => onRandomDensityChange(parseInt(e.target.value))}
            />
          </div>

          {/* Export Size */}
          <div className="control-group">
            <label>
              Export Size (px)
              <input
                type="number"
                min="100"
                max="2000"
                value={longSidePx}
                onChange={(e) => onLongSidePxChange(Math.max(100, parseInt(e.target.value) || 100))}
              />
            </label>
          </div>

          {/* Infinite Canvas Mode */}
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
        </>
      )}
    </div>
  );
};
