import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Grid, copyGrid } from '../logic/life';

export type CellShape = 'square' | 'circle' | 'rounded';

interface GridCanvasProps {
  grid: Grid;
  onGridChange: (grid: Grid) => void;
  aliveColor: string;
  deadColor: string;
  backgroundColor: string;
  cellGap: number;
  editable: boolean;
  cellSize: number;
  cellShape?: CellShape;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  grid,
  onGridChange,
  aliveColor,
  deadColor,
  backgroundColor,
  cellGap,
  editable,
  cellSize,
  cellShape = 'square',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'paint' | 'erase' | null>(null);
  const lastCellRef = useRef<{ row: number; col: number } | null>(null);

  const rows = grid.length;
  const cols = grid[0].length;
  const width = cols * cellSize;
  const height = rows * cellSize;

  // Draw a cell with the specified shape
  const drawCell = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rectWidth: number,
    rectHeight: number,
    color: string
  ) => {
    ctx.fillStyle = color;

    if (cellShape === 'circle') {
      const centerX = x + rectWidth / 2;
      const centerY = y + rectHeight / 2;
      const radius = Math.min(rectWidth, rectHeight) / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (cellShape === 'rounded') {
      const radius = Math.min(rectWidth, rectHeight) * 0.25;
      ctx.beginPath();
      ctx.roundRect(x, y, rectWidth, rectHeight, radius);
      ctx.fill();
    } else {
      // square
      ctx.fillRect(x, y, rectWidth, rectHeight);
    }
  }, [cellShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rectWidth = Math.max(0, cellSize - cellGap);
    const rectHeight = Math.max(0, cellSize - cellGap);
    const offsetX = cellGap / 2;
    const offsetY = cellGap / 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellSize + offsetX;
        const y = r * cellSize + offsetY;
        const color = grid[r][c] ? aliveColor : deadColor;
        drawCell(ctx, x, y, rectWidth, rectHeight, color);
      }
    }
  }, [grid, aliveColor, deadColor, backgroundColor, cellGap, cellSize, rows, cols, width, height, drawCell]);

  const getCellFromEvent = (e: React.MouseEvent<HTMLCanvasElement>): { row: number; col: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return { row, col };
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;
    e.preventDefault();

    const cell = getCellFromEvent(e);
    if (!cell) return;

    // Right click = erase, left click = paint
    const isRightClick = e.button === 2;
    const mode = isRightClick ? 'erase' : 'paint';

    setIsDragging(true);
    setDragMode(mode);
    lastCellRef.current = cell;

    // Apply to initial cell
    const newGrid = copyGrid(grid);
    if (mode === 'paint') {
      newGrid[cell.row][cell.col] = true;
    } else {
      newGrid[cell.row][cell.col] = false;
    }
    onGridChange(newGrid);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !isDragging || !dragMode) return;

    const cell = getCellFromEvent(e);
    if (!cell) return;

    // Skip if same cell
    if (lastCellRef.current &&
        lastCellRef.current.row === cell.row &&
        lastCellRef.current.col === cell.col) {
      return;
    }

    lastCellRef.current = cell;

    const newGrid = copyGrid(grid);
    if (dragMode === 'paint') {
      newGrid[cell.row][cell.col] = true;
    } else {
      newGrid[cell.row][cell.col] = false;
    }
    onGridChange(newGrid);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    lastCellRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragMode(null);
    lastCellRef.current = null;
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent context menu
  };

  // Handle click for toggle (when not dragging)
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Click is handled by mousedown for drag painting
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
      className={editable ? 'grid-canvas editable' : 'grid-canvas'}
    />
  );
};
