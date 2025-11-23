import { Grid } from './life';

export interface ExportOptions {
  width: number;
  height: number;
  aliveColor: string;
  deadColor: string;
  gapFactor: number;
}

export function frameToSvg(frame: Grid, options: ExportOptions): string {
  const { width, height, aliveColor, gapFactor } = options;
  const rows = frame.length;
  const cols = frame[0].length;

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const gap = Math.min(cellWidth, cellHeight) * gapFactor;
  const rectWidth = cellWidth - gap;
  const rectHeight = cellHeight - gap;
  const offsetX = gap / 2;
  const offsetY = gap / 2;

  let svgContent = '';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (frame[r][c]) {
        const x = c * cellWidth + offsetX;
        const y = r * cellHeight + offsetY;
        svgContent += `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" fill="${aliveColor}" />\n`;
      }
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${svgContent}</svg>`;

  return svg;
}
