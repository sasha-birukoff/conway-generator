import React, { useState, useEffect } from 'react';
import { GridCanvas } from './components/GridCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import {
  Grid,
  createEmptyGrid,
  createRandomGrid,
  copyGrid,
  stepConway,
} from './logic/life';
import { PRESETS } from './logic/presets';
import { frameToSvg } from './logic/exportSvg';
import { framesToGif } from './logic/exportGif';
import JSZip from 'jszip';
import './styles.css';

type Mode = 'edit' | 'sim';

export default function App() {
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid(5, 5));
  const [mode, setMode] = useState<Mode>('edit');
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [frames, setFrames] = useState<Grid[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(0);
  const [gapFactor, setGapFactor] = useState(0.5);
  const [aliveColor, setAliveColor] = useState('#D21313');
  const [deadColor, setDeadColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [randomDensity, setRandomDensity] = useState(30);
  const [longSidePx, setLongSidePx] = useState(1000);
  const [isExporting, setIsExporting] = useState(false);

  const TICK_INTERVAL = 200;
  const MAX_FRAMES = 20;

  useEffect(() => {
    if (!isPlaying || mode !== 'sim') return;

    const interval = setInterval(() => {
      setGrid((prevGrid) => {
        const nextGrid = stepConway(prevGrid);

        setFrames((prevFrames) => {
          if (prevFrames.length < MAX_FRAMES) {
            return [...prevFrames, copyGrid(nextGrid)];
          }
          return prevFrames;
        });

        setGeneration((prev) => prev + 1);
        return nextGrid;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
    setCols(cols);
    setGrid(createEmptyGrid(newRows, cols));
    setMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleColsChange = (newCols: number) => {
    setRows(rows);
    setCols(newCols);
    setGrid(createEmptyGrid(rows, newCols));
    setMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handlePlayPause = () => {
    if (mode === 'edit') {
      setMode('sim');
      setFrames([copyGrid(grid)]);
      setCurrentFrameIndex(0);
      setStartFrame(0);
      setEndFrame(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = () => {
    if (mode === 'sim' && !isPlaying) {
      const nextGrid = stepConway(grid);
      setGrid(nextGrid);
      setGeneration((prev) => prev + 1);

      setFrames((prevFrames) => {
        if (prevFrames.length < MAX_FRAMES) {
          const newFrames = [...prevFrames, copyGrid(nextGrid)];
          setEndFrame(newFrames.length - 1);
          return newFrames;
        }
        return prevFrames;
      });
    }
  };

  const handleReset = () => {
    const newGrid = createRandomGrid(rows, cols, randomDensity);
    setGrid(newGrid);
    setMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleClear = () => {
    setGrid(createEmptyGrid(rows, cols));
    setMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    setRows(preset.rows);
    setCols(preset.cols);
    setGrid(copyGrid(preset.grid));
    setMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleFrameIndexChange = (index: number) => {
    setIsPlaying(false);
    setCurrentFrameIndex(index);
    if (frames[index]) {
      setGrid(copyGrid(frames[index]));
    }
  };

  const calculateExportDimensions = (): { width: number; height: number } => {
    if (cols >= rows) {
      return {
        width: longSidePx,
        height: Math.round(longSidePx * (rows / cols)),
      };
    } else {
      return {
        height: longSidePx,
        width: Math.round(longSidePx * (cols / rows)),
      };
    }
  };

  const handleExportSvg = async () => {
    if (startFrame > endFrame) return;

    setIsExporting(true);
    try {
      const { width, height } = calculateExportDimensions();
      const zip = new JSZip();

      for (let i = startFrame; i <= endFrame; i++) {
        const frame = frames[i];
        const svg = frameToSvg(frame, {
          width,
          height,
          aliveColor,
          deadColor,
          gapFactor,
        });

        const filename = `frame_${String(i).padStart(3, '0')}.svg`;
        zip.file(filename, svg);
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conway_frames_${startFrame}-${endFrame}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('SVG export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGif = async () => {
    if (startFrame > endFrame) return;

    setIsExporting(true);
    try {
      const { width, height } = calculateExportDimensions();
      const framesToExport = frames.slice(startFrame, endFrame + 1);

      const blob = await framesToGif(framesToExport, {
        width,
        height,
        aliveColor,
        gapFactor,
        frameDelay: 200,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conway_frames_${startFrame}-${endFrame}.gif`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('GIF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const displayGrid = mode === 'sim' && frames.length > 0 ? frames[currentFrameIndex] : grid;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Conway Asset Generator</h1>
      </header>

      <div className="app-content">
        <ControlsPanel
          rows={rows}
          onRowsChange={handleRowsChange}
          cols={cols}
          onColsChange={handleColsChange}
          gapFactor={gapFactor}
          onGapFactorChange={setGapFactor}
          aliveColor={aliveColor}
          onAliveColorChange={setAliveColor}
          deadColor={deadColor}
          onDeadColorChange={setDeadColor}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          randomDensity={randomDensity}
          onRandomDensityChange={setRandomDensity}
          longSidePx={longSidePx}
          onLongSidePxChange={setLongSidePx}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onStep={handleStep}
          onReset={handleReset}
          onClear={handleClear}
          onPresetSelect={handlePresetSelect}
          mode={mode}
        />

        <div className="grid-section">
          <GridCanvas
            grid={displayGrid}
            onGridChange={setGrid}
            aliveColor={aliveColor}
            deadColor={deadColor}
            backgroundColor={backgroundColor}
            gapFactor={gapFactor}
            editable={mode === 'edit'}
            width={400}
            height={400}
          />
        </div>

        <TimelinePanel
          generation={generation}
          frames={frames}
          currentFrameIndex={currentFrameIndex}
          onFrameIndexChange={handleFrameIndexChange}
          startFrame={startFrame}
          onStartFrameChange={setStartFrame}
          endFrame={endFrame}
          onEndFrameChange={setEndFrame}
          onExportSvg={handleExportSvg}
          onExportGif={handleExportGif}
          isExporting={isExporting}
        />
      </div>
    </div>
  );
}
