import React from 'react';

interface SettingsPanelProps {
  cellGap: number;
  onCellGapChange: (gap: number) => void;
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
  infiniteCanvasMode: boolean;
  onInfiniteCanvasModeChange: (enabled: boolean) => void;
  mode: 'edit' | 'sim';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  cellGap,
  onCellGapChange,
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
  infiniteCanvasMode,
  onInfiniteCanvasModeChange,
  mode,
}) => {
  return (
    <div className="settings-panel">
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
          <span className="color-label">Dead</span>
          <input
            type="color"
            value={deadColor}
            onChange={(e) => onDeadColorChange(e.target.value)}
          />
        </label>
        <label>
          <span className="color-label">BG</span>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
          />
        </label>
      </div>

      <div className="control-group">
        <label>
          Cell Gap (px):
          <input
            type="range"
            min="0"
            max="20"
            value={cellGap}
            onChange={(e) => onCellGapChange(parseInt(e.target.value))}
          />
          <span>{cellGap}px</span>
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
            max="2000"
            value={longSidePx}
            onChange={(e) => onLongSidePxChange(Math.max(100, parseInt(e.target.value) || 100))}
          />
        </label>
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
    </div>
  );
};
