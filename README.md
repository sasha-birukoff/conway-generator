# Conway Asset Generator

A small React + TypeScript tool for Conway (conway.ai) to generate **Conway's Game of Life** grid animations and static frames as **transparent GIFs** and **SVGs**.

Designed for branding / visual asset creation — not a general-purpose simulator.

---

## Tech Stack

- React + TypeScript + Vite
- Browser GIF encoder (gif.js)
- JSZip for SVG ZIP export

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

---

## How It Works

### Edit Mode
- Create a grid (1–30 rows/cols)
- Click cells to toggle alive/dead
- Load presets (Glider, Pulsar, Spider)
- Adjust colors, gap factor, and export resolution

### Simulation Mode
- Press **Play** to start Conway's Game of Life
- Grid records up to **20 frames**
- Use **Pause/Step** to control the animation
- **Reset** randomizes and returns to edit mode
- **Clear** wipes the grid and returns to edit mode

### Export
- **Scrubber**: Select which frames to export (start/end)
- **Export SVG ZIP**: Individual transparent SVG frames
- **Export GIF**: Animated transparent GIF (200ms per frame)

---

## Features

- **Minimal UI**: White background, gray panels, Conway red accents (#D21313)
- **No frameworks**: Pure CSS, no Tailwind or extra dependencies
- **Configurable**: Colors, cell gap, grid size, export resolution
- **Smart export sizing**: Maintains aspect ratio, specify long side (px)
- **Transparent outputs**: GIFs and SVGs render with transparent backgrounds

---

## Project Structure

```
src/
  ├── main.tsx
  ├── App.tsx
  ├── styles.css
  ├── components/
  │   ├── GridCanvas.tsx
  │   ├── ControlsPanel.tsx
  │   └── TimelinePanel.tsx
  └── logic/
      ├── life.ts           (Conway rules)
      ├── exportSvg.ts      (SVG rendering)
      ├── exportGif.ts      (GIF encoding)
      └── presets.ts        (Built-in patterns)
```
