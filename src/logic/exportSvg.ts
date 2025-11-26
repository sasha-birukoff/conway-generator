import { Grid } from './life';

export interface ExportOptions {
  width: number;
  height: number;
  aliveColor: string;
  deadColor: string;
  cellGap: number;
}

export function frameToSvg(frame: Grid, options: ExportOptions): string {
  const { width, height, aliveColor, cellGap } = options;
  const rows = frame.length;
  const cols = frame[0].length;

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const rectWidth = Math.max(0, cellWidth - cellGap);
  const rectHeight = Math.max(0, cellHeight - cellGap);
  const offsetX = cellGap / 2;
  const offsetY = cellGap / 2;

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
