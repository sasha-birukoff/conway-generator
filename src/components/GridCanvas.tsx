import React, { useRef, useEffect } from 'react';
import { Grid, toggleCell } from '../logic/life';

interface GridCanvasProps {
  grid: Grid;
  onGridChange: (grid: Grid) => void;
  aliveColor: string;
  deadColor: string;
  backgroundColor: string;
  gapFactor: number;
  editable: boolean;
  width?: number;
  height?: number;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  grid,
  onGridChange,
  aliveColor,
  deadColor,
  backgroundColor,
  gapFactor,
  editable,
  width = 400,
  height = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rows = grid.length;
    const cols = grid[0].length;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    const gap = Math.min(cellWidth, cellHeight) * gapFactor;
    const rectWidth = cellWidth - gap;
    const rectHeight = cellHeight - gap;
    const offsetX = gap / 2;
    const offsetY = gap / 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellWidth + offsetX;
        const y = r * cellHeight + offsetY;

        ctx.fillStyle = grid[r][c] ? aliveColor : deadColor;
        ctx.fillRect(x, y, rectWidth, rectHeight);
      }
    }
  }, [grid, aliveColor, deadColor, backgroundColor, gapFactor, width, height]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rows = grid.length;
    const cols = grid[0].length;
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

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
