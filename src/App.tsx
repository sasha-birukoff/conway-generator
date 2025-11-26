import React, { useState, useEffect } from 'react';
import { GridCanvas } from './components/GridCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { SettingsPanel } from './components/SettingsPanel';
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
  const [cellGap, setCellGap] = useState(16);
  const [aliveColor, setAliveColor] = useState('#D21313');
  const [deadColor, setDeadColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [randomDensity, setRandomDensity] = useState(30);
  const [longSidePx, setLongSidePx] = useState(400);
  const [isExporting, setIsExporting] = useState(false);
  const [infiniteCanvasMode, setInfiniteCanvasMode] = useState(false);
  const [infiniteGrid, setInfiniteGrid] = useState<Grid>(createEmptyGrid(30, 30));

  const TICK_INTERVAL = 200;
  const MAX_FRAMES = 20;
  const BACKGROUND_SIZE = 30;

  // Calculate viewport offset (center the display grid in the background)
  const viewportOffsetRow = Math.floor((BACKGROUND_SIZE - rows) / 2);
  const viewportOffsetCol = Math.floor((BACKGROUND_SIZE - cols) / 2);

  useEffect(() => {
    if (!isPlaying || mode !== 'sim') return;

    const interval = setInterval(() => {
      if (infiniteCanvasMode) {
        // Infinite canvas mode: simulate on 30x30 background, display viewport
        setInfiniteGrid((prevInfiniteGrid) => {
          const nextInfiniteGrid = stepConway(prevInfiniteGrid);

          // Extract viewport portion for display and recording
          const viewportGrid: Grid = [];
          for (let r = 0; r < rows; r++) {
            const row: boolean[] = [];
            for (let c = 0; c < cols; c++) {
              row.push(nextInfiniteGrid[viewportOffsetRow + r][viewportOffsetCol + c]);
            }
            viewportGrid.push(row);
          }

          // Record frame
          setFrames((prevFrames) => {
            if (prevFrames.length < MAX_FRAMES) {
              const copiedGrid = copyGrid(viewportGrid);
              const newFrames = [...prevFrames, copiedGrid];

              // Enhanced logging
              const gridStr = copiedGrid.map(row => row.map(c => c ? '█' : '·').join('')).join('\n');
              const aliveCount = copiedGrid.flat().filter(c => c).length;
              console.log(`Frame ${newFrames.length - 1}: ${rows}x${cols} grid (${aliveCount} alive)\n${gridStr}`);

              setCurrentFrameIndex(newFrames.length - 1);
              setEndFrame(newFrames.length - 1);
              return newFrames;
            }
            return prevFrames;
          });

          // Update display grid with viewport
          setGrid(viewportGrid);
          setGeneration((prev) => prev + 1);
          return nextInfiniteGrid;
        });
      } else {
        // Local mode: simulate on user's grid
        setGrid((prevGrid) => {
          const nextGrid = stepConway(prevGrid);

          // Record frame
          setFrames((prevFrames) => {
            if (prevFrames.length < MAX_FRAMES) {
              const copiedGrid = copyGrid(nextGrid);
              const newFrames = [...prevFrames, copiedGrid];

              // Enhanced logging
              const gridStr = copiedGrid.map(row => row.map(c => c ? '█' : '·').join('')).join('\n');
              const aliveCount = copiedGrid.flat().filter(c => c).length;
              console.log(`Frame ${newFrames.length - 1}: ${nextGrid.length}x${nextGrid[0].length} grid (${aliveCount} alive)\n${gridStr}`);

              setCurrentFrameIndex(newFrames.length - 1);
              setEndFrame(newFrames.length - 1);
              return newFrames;
            }
            return prevFrames;
          });

          setGeneration((prev) => prev + 1);
          return nextGrid;
        });
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying, mode, infiniteCanvasMode, rows, cols, viewportOffsetRow, viewportOffsetCol]);

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
      // Frame 0 = initial grid state
      setFrames([copyGrid(grid)]);
      setCurrentFrameIndex(0);
      setStartFrame(0);
      setEndFrame(0);

      // Initialize infinite grid if in infinite canvas mode
      if (infiniteCanvasMode) {
        const newInfiniteGrid = createEmptyGrid(BACKGROUND_SIZE, BACKGROUND_SIZE);
        // Copy current grid into center of infinite grid
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            newInfiniteGrid[viewportOffsetRow + r][viewportOffsetCol + c] = grid[r][c];
          }
        }
        setInfiniteGrid(newInfiniteGrid);
      }

      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = () => {
    if (mode === 'sim' && !isPlaying) {
      if (infiniteCanvasMode) {
        setInfiniteGrid((prevInfiniteGrid) => {
          const nextInfiniteGrid = stepConway(prevInfiniteGrid);

          // Extract viewport portion
          const viewportGrid: Grid = [];
          for (let r = 0; r < rows; r++) {
            const row: boolean[] = [];
            for (let c = 0; c < cols; c++) {
              row.push(nextInfiniteGrid[viewportOffsetRow + r][viewportOffsetCol + c]);
            }
            viewportGrid.push(row);
          }

          setGrid(viewportGrid);
          setGeneration((prev) => prev + 1);

          setFrames((prevFrames) => {
            if (prevFrames.length < MAX_FRAMES) {
              const newFrames = [...prevFrames, copyGrid(viewportGrid)];
              setEndFrame(newFrames.length - 1);
              return newFrames;
            }
            return prevFrames;
          });

          return nextInfiniteGrid;
        });
      } else {
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
          cellGap,
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

      console.log(`Starting GIF export: ${width}x${height}, ${framesToExport.length} frames`);

      const gifBlob = await framesToGif(framesToExport, {
        width,
        height,
        aliveColor,
        deadColor,
        cellGap,
        frameDelay: TICK_INTERVAL,
      });

      const url = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conway_${startFrame}-${endFrame}.gif`;
      a.click();
      URL.revokeObjectURL(url);

      console.log('GIF export complete');
    } catch (err) {
      console.error('GIF export failed:', err);
      alert(`GIF export failed: ${err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Show live grid during sim (unless scrubbing), otherwise show scrubbed frame
  const displayGrid = mode === 'sim' && isPlaying ? grid : (mode === 'sim' && frames.length > 0 ? frames[currentFrameIndex] : grid);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Conway Asset Generator</h1>
      </header>

      <div className="app-content">
        <SettingsPanel
          cellGap={cellGap}
          onCellGapChange={setCellGap}
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
          infiniteCanvasMode={infiniteCanvasMode}
          onInfiniteCanvasModeChange={setInfiniteCanvasMode}
          mode={mode}
        />

        <ControlsPanel
          rows={rows}
          onRowsChange={handleRowsChange}
          cols={cols}
          onColsChange={handleColsChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
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
            cellGap={cellGap}
            editable={mode === 'edit'}
            cellSize={40}
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
