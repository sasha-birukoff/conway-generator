import { Grid } from './life';
import GIF from 'gif.js';

export interface GifExportOptions {
  width: number;
  height: number;
  aliveColor: string;
  gapFactor: number;
  frameDelay?: number;
}

export async function framesToGif(
  frames: Grid[],
  options: GifExportOptions
): Promise<Blob> {
  const { width, height, aliveColor, gapFactor, frameDelay = 200 } = options;

  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: '/gif.worker.js',
    });

    for (const frame of frames) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) reject(new Error('Could not get canvas context'));

      const rows = frame.length;
      const cols = frame[0].length;
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const gap = Math.min(cellWidth, cellHeight) * gapFactor;
      const rectWidth = cellWidth - gap;
      const rectHeight = cellHeight - gap;
      const offsetX = gap / 2;
      const offsetY = gap / 2;

      ctx!.clearRect(0, 0, width, height);
      ctx!.fillStyle = aliveColor;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (frame[r][c]) {
            const x = c * cellWidth + offsetX;
            const y = r * cellHeight + offsetY;
            ctx!.fillRect(x, y, rectWidth, rectHeight);
          }
        }
      }

      gif.addFrame(canvas, { delay: frameDelay });
    }

    gif.on('finished', (blob: Blob) => {
      resolve(blob);
    });

    gif.on('error', (err: any) => {
      reject(err);
    });

    gif.render();
  });
}
