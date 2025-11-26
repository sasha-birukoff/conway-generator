import React, { useRef, useEffect } from 'react';
import { Grid, toggleCell } from '../logic/life';

interface GridCanvasProps {
  grid: Grid;
  onGridChange: (grid: Grid) => void;
  aliveColor: string;
  deadColor: string;
  backgroundColor: string;
  cellGap: number;
  editable: boolean;
  cellSize: number;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rows = grid.length;
  const cols = grid[0].length;
  const width = cols * cellSize;
  const height = rows * cellSize;

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

        ctx.fillStyle = grid[r][c] ? aliveColor : deadColor;
        ctx.fillRect(x, y, rectWidth, rectHeight);
      }
    }
  }, [grid, aliveColor, deadColor, backgroundColor, cellGap, cellSize, rows, cols]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const newGrid = toggleCell(grid, row, col);
      onGridChange(newGrid);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className={editable ? 'grid-canvas editable' : 'grid-canvas'}
    />
  );
};
