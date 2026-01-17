import React from 'react';

interface TimelinePanelProps {
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

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
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
  const hasFrames = frames.length > 0;
  const maxFrame = frames.length - 1;

  return (
    <div className="timeline-panel">
      {/* Generation Counter */}
      <p className="generation-text">Generation: {generation}</p>

      {hasFrames ? (
        <>
          {/* Frame Slider */}
          <div className="control-group">
            <div className="slider-row">
              <span className="slider-label">Frame</span>
              <span className="value-display">{currentFrameIndex} / {maxFrame}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxFrame}
              value={currentFrameIndex}
              onChange={(e) => onFrameIndexChange(parseInt(e.target.value))}
            />
          </div>

          {/* Start/End Frame */}
          <div className="control-group row-cols-group">
            <label>
              Start Frame
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
            </label>
            <label>
              End Frame
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
            </label>
          </div>

          {/* Export Buttons */}
          <div className="control-group buttons">
            <button
              onClick={onExportGif}
              disabled={isExporting || startFrame > endFrame}
              className="btn-export"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M8 10L4.5 6.5M8 10l3.5-3.5M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isExporting ? 'Exporting...' : 'Export GIF'}
            </button>
            <button
              onClick={onExportSvg}
              disabled={isExporting || startFrame > endFrame}
              className="btn-export-secondary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1v9M8 10L4.5 6.5M8 10l3.5-3.5M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isExporting ? 'Exporting...' : 'Export SVG ZIP'}
            </button>
          </div>
        </>
      ) : (
        <p className="no-frames-text">Press Play to start simulation and record frames.</p>
      )}
    </div>
  );
};
