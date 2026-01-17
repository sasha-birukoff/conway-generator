import React, { useState, useEffect } from 'react';
import { GridCanvas, CellShape } from './components/GridCanvas';
import { ControlsPanel } from './components/ControlsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { TimelinePanel } from './components/TimelinePanel';
import { AppMode } from './components/ModeToggle';
import {
  Grid,
  createEmptyGrid,
  createRandomGrid,
  createSymmetricGrid,
  copyGrid,
  stepConway,
  SymmetryType,
} from './logic/life';
import { PRESETS } from './logic/presets';
import { STATIC_PRESETS } from './logic/staticPresets';
import {
  frameToSvg,
  downloadSvg,
  downloadPng,
  copySvgToClipboard,
} from './logic/exportSvg';
import {
  FlowDirection,
  GenerationMethod,
  FlowSymmetry,
  generateFlowPattern,
  FLOW_PRESETS,
} from './logic/flowGeneration';
import { framesToGif } from './logic/exportGif';
import JSZip from 'jszip';
import './styles.css';

type SimMode = 'edit' | 'sim';

export default function App() {
  // App mode: static or animated
  const [appMode, setAppMode] = useState<AppMode>('static');

  // Grid state (shared between modes)
  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(7);
  const [grid, setGrid] = useState<Grid>(createEmptyGrid(7, 7));

  // Simulation mode (for animated)
  const [simMode, setSimMode] = useState<SimMode>('edit');
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [frames, setFrames] = useState<Grid[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(0);

  // Colors (shared)
  const [cellGap, setCellGap] = useState(16);
  const [aliveColor, setAliveColor] = useState('#CC0A14');
  const [deadColor, setDeadColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  // Static mode only
  const [cellShape, setCellShape] = useState<CellShape>('square');
  const [canvasSize, setCanvasSize] = useState(400);
  const [isCopied, setIsCopied] = useState(false);

  // Flow generation state (static mode)
  const [flowDirection, setFlowDirection] = useState<FlowDirection>('s-curve');
  const [flowIntensity, setFlowIntensity] = useState(70);
  const [flowSymmetry, setFlowSymmetry] = useState<FlowSymmetry>('none');
  const [generationMethod, setGenerationMethod] = useState<GenerationMethod>('carve');
  const [fillAmount, setFillAmount] = useState(70);

  // Animated mode only
  const [randomDensity, setRandomDensity] = useState(30);
  const [longSidePx, setLongSidePx] = useState(400);
  const [isExporting, setIsExporting] = useState(false);
  const [infiniteCanvasMode, setInfiniteCanvasMode] = useState(false);
  const [infiniteGrid, setInfiniteGrid] = useState<Grid>(createEmptyGrid(30, 30));

  const TICK_INTERVAL = 200;
  const MAX_FRAMES = 20;
  const BACKGROUND_SIZE = 30;

  const viewportOffsetRow = Math.floor((BACKGROUND_SIZE - rows) / 2);
  const viewportOffsetCol = Math.floor((BACKGROUND_SIZE - cols) / 2);

  // Handle mode change
  const handleAppModeChange = (newMode: AppMode) => {
    // Stop simulation when switching modes
    if (isPlaying) {
      setIsPlaying(false);
    }
    if (simMode === 'sim') {
      setSimMode('edit');
    }
    setAppMode(newMode);
  };

  // Simulation effect (animated mode only)
  useEffect(() => {
    if (appMode !== 'animated' || !isPlaying || simMode !== 'sim') return;

    const interval = setInterval(() => {
      if (infiniteCanvasMode) {
        setInfiniteGrid((prevInfiniteGrid) => {
          const nextInfiniteGrid = stepConway(prevInfiniteGrid);
          const viewportGrid: Grid = [];
          for (let r = 0; r < rows; r++) {
            const row: boolean[] = [];
            for (let c = 0; c < cols; c++) {
              row.push(nextInfiniteGrid[viewportOffsetRow + r][viewportOffsetCol + c]);
            }
            viewportGrid.push(row);
          }

          setFrames((prevFrames) => {
            if (prevFrames.length < MAX_FRAMES) {
              const copiedGrid = copyGrid(viewportGrid);
              const newFrames = [...prevFrames, copiedGrid];
              setCurrentFrameIndex(newFrames.length - 1);
              setEndFrame(newFrames.length - 1);
              return newFrames;
            }
            return prevFrames;
          });

          setGrid(viewportGrid);
          setGeneration((prev) => prev + 1);
          return nextInfiniteGrid;
        });
      } else {
        setGrid((prevGrid) => {
          const nextGrid = stepConway(prevGrid);
          setFrames((prevFrames) => {
            if (prevFrames.length < MAX_FRAMES) {
              const copiedGrid = copyGrid(nextGrid);
              const newFrames = [...prevFrames, copiedGrid];
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
  }, [appMode, isPlaying, simMode, infiniteCanvasMode, rows, cols, viewportOffsetRow, viewportOffsetCol]);

  // Grid handlers
  const handleRowsChange = (newRows: number) => {
    setRows(newRows);
    setGrid(createEmptyGrid(newRows, cols));
    resetSimulation();
  };

  const handleColsChange = (newCols: number) => {
    setCols(newCols);
    setGrid(createEmptyGrid(rows, newCols));
    resetSimulation();
  };

  const resetSimulation = () => {
    setSimMode('edit');
    setGeneration(0);
    setFrames([]);
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  // Animated mode handlers
  const handlePlayPause = () => {
    if (simMode === 'edit') {
      setSimMode('sim');
      setFrames([copyGrid(grid)]);
      setCurrentFrameIndex(0);
      setStartFrame(0);
      setEndFrame(0);

      if (infiniteCanvasMode) {
        const newInfiniteGrid = createEmptyGrid(BACKGROUND_SIZE, BACKGROUND_SIZE);
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

  const handleReset = () => {
    const newGrid = createRandomGrid(rows, cols, randomDensity);
    setGrid(newGrid);
    resetSimulation();
  };

  const handleClear = () => {
    setGrid(createEmptyGrid(rows, cols));
    resetSimulation();
  };

  const handleSymmetricReset = (symmetry: SymmetryType) => {
    const newGrid = createSymmetricGrid(rows, cols, randomDensity, symmetry);
    setGrid(newGrid);
    resetSimulation();
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    setRows(preset.rows);
    setCols(preset.cols);
    setGrid(copyGrid(preset.grid));
    resetSimulation();
  };

  // Static mode handlers
  const handleStaticPresetSelect = (presetIndex: number) => {
    const preset = STATIC_PRESETS[presetIndex];
    setRows(preset.rows);
    setCols(preset.cols);
    setGrid(copyGrid(preset.grid));
  };

  // Flow generation handlers
  const handleGenerate = () => {
    const newGrid = generateFlowPattern({
      rows,
      cols,
      direction: flowDirection,
      intensity: flowIntensity,
      fillAmount,
      symmetry: flowSymmetry,
      method: generationMethod,
    });
    setGrid(newGrid);
  };

  const handleShuffle = () => {
    // Regenerate with same settings
    handleGenerate();
  };

  const handleFlowPresetSelect = (presetIndex: number) => {
    const preset = FLOW_PRESETS[presetIndex];
    setGenerationMethod(preset.method);
    setFlowDirection(preset.direction);
    setFlowIntensity(preset.intensity);
    setFillAmount(preset.fillAmount);
    setFlowSymmetry(preset.symmetry);

    // Generate immediately with preset settings
    const newGrid = generateFlowPattern({
      rows,
      cols,
      direction: preset.direction,
      intensity: preset.intensity,
      fillAmount: preset.fillAmount,
      symmetry: preset.symmetry,
      method: preset.method,
    });
    setGrid(newGrid);
  };

  // Export handlers
  const getExportOptions = () => ({
    width: canvasSize,
    height: canvasSize,
    aliveColor,
    deadColor,
    cellGap,
    cellShape,
    backgroundColor,
    includeBackground: true,
  });

  const handleExportStaticSvg = () => {
    downloadSvg(grid, getExportOptions(), 'conway-pattern.svg');
  };

  const handleExportStaticPng = async () => {
    await downloadPng(grid, getExportOptions(), 'conway-pattern.png');
  };

  const handleCopySvg = async () => {
    await copySvgToClipboard(grid, getExportOptions());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Frame handlers (animated mode)
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
    } catch (err) {
      console.error('GIF export failed:', err);
      alert(`GIF export failed: ${err}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Display grid
  const displayGrid = simMode === 'sim' && isPlaying
    ? grid
    : (simMode === 'sim' && frames.length > 0 ? frames[currentFrameIndex] : grid);

  // Determine if editable
  const isEditable = appMode === 'static' || simMode === 'edit';

  return (
    <div className="app">
      <div className="app-content">
        {/* Left Panel - Settings */}
        <SettingsPanel
          appMode={appMode}
          onAppModeChange={handleAppModeChange}
          cellGap={cellGap}
          onCellGapChange={setCellGap}
          aliveColor={aliveColor}
          onAliveColorChange={setAliveColor}
          deadColor={deadColor}
          onDeadColorChange={setDeadColor}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          rows={rows}
          onRowsChange={handleRowsChange}
          cols={cols}
          onColsChange={handleColsChange}
          cellShape={cellShape}
          onCellShapeChange={setCellShape}
          canvasSize={canvasSize}
          onCanvasSizeChange={setCanvasSize}
          randomDensity={randomDensity}
          onRandomDensityChange={setRandomDensity}
          longSidePx={longSidePx}
          onLongSidePxChange={setLongSidePx}
          infiniteCanvasMode={infiniteCanvasMode}
          onInfiniteCanvasModeChange={setInfiniteCanvasMode}
          mode={simMode}
        />

        {/* Right Panel - Controls */}
        <ControlsPanel
          appMode={appMode}
          rows={rows}
          onRowsChange={handleRowsChange}
          cols={cols}
          onColsChange={handleColsChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSymmetricReset={handleSymmetricReset}
          onClear={handleClear}
          onPresetSelect={handlePresetSelect}
          onStaticPresetSelect={handleStaticPresetSelect}
          onShuffle={handleShuffle}
          mode={simMode}
          flowDirection={flowDirection}
          onFlowDirectionChange={setFlowDirection}
          flowIntensity={flowIntensity}
          onFlowIntensityChange={setFlowIntensity}
          flowSymmetry={flowSymmetry}
          onFlowSymmetryChange={setFlowSymmetry}
          generationMethod={generationMethod}
          onGenerationMethodChange={setGenerationMethod}
          fillAmount={fillAmount}
          onFillAmountChange={setFillAmount}
          onGenerate={handleGenerate}
          onFlowPresetSelect={handleFlowPresetSelect}
          onExportSvg={handleExportStaticSvg}
          onExportPng={handleExportStaticPng}
          onCopySvg={handleCopySvg}
          isCopied={isCopied}
        />

        {/* Canvas */}
        <div className="grid-section">
          <GridCanvas
            grid={displayGrid}
            onGridChange={setGrid}
            aliveColor={aliveColor}
            deadColor={deadColor}
            backgroundColor={backgroundColor}
            cellGap={cellGap}
            editable={isEditable}
            cellSize={40}
            cellShape={appMode === 'static' ? cellShape : 'square'}
          />
        </div>

        {/* Timeline Panel (animated mode only) */}
        {appMode === 'animated' && (
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
        )}
      </div>
    </div>
  );
}
