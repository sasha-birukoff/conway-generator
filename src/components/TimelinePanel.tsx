import React, { useState } from 'react';

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
      <h2>Timeline</h2>

      <div className="control-group">
        <p className="generation-text">Generation: {generation}</p>
      </div>

      {hasFrames && (
        <>
          <div className="control-group">
            <label>
              Frame:
              <input
                type="range"
                min="0"
                max={maxFrame}
                value={currentFrameIndex}
                onChange={(e) => onFrameIndexChange(parseInt(e.target.value))}
              />
              <span>{currentFrameIndex} / {maxFrame}</span>
            </label>
          </div>

          <div className="control-group">
            <label>
              Start Frame:
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
          </div>

          <div className="control-group">
            <label>
              End Frame:
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

          <div className="control-group buttons">
            <button
              onClick={onExportSvg}
              disabled={isExporting || startFrame > endFrame}
              className="btn-primary"
            >
              {isExporting ? 'Exporting...' : 'Export SVG ZIP'}
            </button>
            <button
              onClick={onExportGif}
              disabled={isExporting || startFrame > endFrame}
              className="btn-primary"
            >
              {isExporting ? 'Exporting...' : 'Export GIF'}
            </button>
          </div>
        </>
      )}

      {!hasFrames && (
        <p className="no-frames-text">No frames yet. Press Play to start simulation.</p>
      )}
    </div>
  );
};
