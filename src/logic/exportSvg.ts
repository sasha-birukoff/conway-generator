import { Grid } from './life';
import { CellShape } from '../components/GridCanvas';

export interface ExportOptions {
  width: number;
  height: number;
  aliveColor: string;
  deadColor: string;
  cellGap: number;
  cellShape?: CellShape;
  backgroundColor?: string;
  includeBackground?: boolean;
}

function getCellShapeSvg(
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  color: string,
  shape: CellShape
): string {
  if (shape === 'circle') {
    const cx = x + rectWidth / 2;
    const cy = y + rectHeight / 2;
    const r = Math.min(rectWidth, rectHeight) / 2;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />`;
  } else if (shape === 'rounded') {
    const rx = Math.min(rectWidth, rectHeight) * 0.25;
    return `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" rx="${rx}" ry="${rx}" fill="${color}" />`;
  } else {
    return `<rect x="${x}" y="${y}" width="${rectWidth}" height="${rectHeight}" fill="${color}" />`;
  }
}

export function frameToSvg(frame: Grid, options: ExportOptions): string {
  const {
    width,
    height,
    aliveColor,
    cellGap,
    cellShape = 'square',
    backgroundColor,
    includeBackground = false
  } = options;

  const rows = frame.length;
  const cols = frame[0].length;

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const rectWidth = Math.max(0, cellWidth - cellGap);
  const rectHeight = Math.max(0, cellHeight - cellGap);
  const offsetX = cellGap / 2;
  const offsetY = cellGap / 2;

  let svgContent = '';

  // Add background if requested
  if (includeBackground && backgroundColor) {
    svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}" />\n`;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (frame[r][c]) {
        const x = c * cellWidth + offsetX;
        const y = r * cellHeight + offsetY;
        svgContent += getCellShapeSvg(x, y, rectWidth, rectHeight, aliveColor, cellShape) + '\n';
      }
    }
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
${svgContent}</svg>`;

  return svg;
}

// Export as PNG using canvas
export async function frameToPng(
  frame: Grid,
  options: ExportOptions
): Promise<Blob> {
  const {
    width,
    height,
    aliveColor,
    deadColor,
    cellGap,
    cellShape = 'square',
    backgroundColor = '#FFFFFF'
  } = options;

  const rows = frame.length;
  const cols = frame[0].length;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const cellWidth = width / cols;
  const cellHeight = height / rows;
  const rectWidth = Math.max(0, cellWidth - cellGap);
  const rectHeight = Math.max(0, cellHeight - cellGap);
  const offsetX = cellGap / 2;
  const offsetY = cellGap / 2;

  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cellWidth + offsetX;
      const y = r * cellHeight + offsetY;
      const color = frame[r][c] ? aliveColor : deadColor;

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
        ctx.fillRect(x, y, rectWidth, rectHeight);
      }
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

// Copy SVG to clipboard
export async function copySvgToClipboard(frame: Grid, options: ExportOptions): Promise<void> {
  const svg = frameToSvg(frame, options);

  try {
    await navigator.clipboard.writeText(svg);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = svg;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

// Download helper
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSvg(frame: Grid, options: ExportOptions, filename: string): void {
  const svg = frameToSvg(frame, options);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

export async function downloadPng(frame: Grid, options: ExportOptions, filename: string): Promise<void> {
  const blob = await frameToPng(frame, options);
  downloadBlob(blob, filename);
}
