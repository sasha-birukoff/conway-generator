import { Grid } from './life';

// Type definition for gif.js
declare global {
  interface Window {
    GIF: any;
  }
}

export interface GifExportOptions {
  width: number;
  height: number;
  aliveColor: string;
  deadColor: string;
  cellGap: number;
  frameDelay?: number;
}

export async function framesToGif(
  frames: Grid[],
  options: GifExportOptions
): Promise<Blob> {
  const { width, height, aliveColor, deadColor, cellGap, frameDelay = 100 } = options;

  // Dynamically load gif.js if not already loaded
  if (!window.GIF) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return new Promise((resolve, reject) => {
    try {
      const gif = new window.GIF({
        workers: 2,
        quality: 10,
        workerScript: '/gif.worker.js',
        width,
        height,
      });

      // Render each frame and add to GIF
      for (const frame of frames) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        const rows = frame.length;
        const cols = frame[0].length;
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        const rectWidth = Math.max(0, cellWidth - cellGap);
        const rectHeight = Math.max(0, cellHeight - cellGap);
        const offsetX = cellGap / 2;
        const offsetY = cellGap / 2;

        // Fill background
        ctx.fillStyle = deadColor;
        ctx.fillRect(0, 0, width, height);

        // Draw alive cells
        ctx.fillStyle = aliveColor;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (frame[r][c]) {
              const x = c * cellWidth + offsetX;
              const y = r * cellHeight + offsetY;
              ctx.fillRect(x, y, rectWidth, rectHeight);
            }
          }
        }

        gif.addFrame(canvas, { delay: frameDelay });
      }

      // Handle completion
      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        reject(error);
      });

      // Start rendering
      gif.render();
    } catch (error) {
      reject(error);
    }
  });
}
