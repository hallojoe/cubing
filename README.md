# Cubing

An interactive 3D Rubik's Cube playground using React, Three.js, React Three Fiber, and Vite.

## Features

- 2×2 to 6×6 cubes with logically correct face and inner-layer turns
- Mouse/touch orbit and zoom, clickable stickers, face controls, reverse and half turns
- Scrambling, timed solve sessions, move counting, undo, reset, solved-state detection
- Automated move-history reversal to recover a solved state
- Filled or wireframe display, four color palettes (Classic Rubik's, Pastel, Neon, Mono)
- Responsive dark interface

## Run locally

```bash
npm install
npm run dev
```

Open the local URL reported by Vite. Verify changes using `npm test` and `npm run build`.

## Playing

Choose a size, press **Scramble cube**, then solve using U/D/L/R/F/B face controls or by clicking stickers. Drag to rotate the camera and scroll to zoom. Shift-click a sticker for a counter-clockwise turn, Alt-click for a half turn. Change **Layer depth** to turn an inner slice. The clock starts on the first user move and stops when the cube becomes solved; move count excludes scrambling and auto-solve.

**Auto-solve design:** This version reverses the recorded move history, so it correctly restores any state reached through this simulator (including scrambles and inner-layer turns). It is **not** a general solver for independently entered cube states. That would require an additional solving algorithm, especially for 4×4–6×6.

The pure cube model is implemented in `src/cube.ts`; React Three Fiber draws the model in `src/App.tsx`. The model invariant tests in `src/cube.test.ts` cover sizes 2–6.
