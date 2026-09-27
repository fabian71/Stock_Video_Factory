# Stock Video Factory Engine

Remotion engine for generating loopable microstock videos from SVG/PNG assets. It supports 16:9, 9:16, 4:3, and 2:3 formats in 1080p or 4K, with deterministic seeds for batch rendering.

## What Is Implemented

- Remotion composition with dynamic metadata for resolution, aspect ratio, FPS, and duration.
- Rapier.js timeline generation for rigid bodies, collision-ready particles, shockwave impulses, and force fields.
- React Three Fiber GLSL background reacting to the main asset position.
- Chroma-js palette generation from the injected asset color.
- SVG self-drawing phase before materialized physical interaction.
- Z-depth particle layering, plexus connections, smart composition anchors, material presets, and configurable motion blur.
- Batch plan generation from `public/assets` and a batch renderer.

## Commands

```bash
npm install
npm run dev
npm run studio
npm run build
npm run render
npm run batch:plan
npm run batch:render
```

`npm run dev` opens the production panel at `http://localhost:3001`. `npm run studio` opens the raw Remotion Studio.

On Windows PowerShell with restricted script execution, use `npm.cmd` instead of `npm`.

## App Workflow

1. Open `http://localhost:3001`.
2. Use `Scene` to set format, resolution, FPS, duration, seed, and color sync.
3. Use `Motion` to tune material, force field, particles, plexus, and motion blur.
4. Use `Assets` to upload/select SVG or PNG files.
5. Use `Render` to export one video or a batch.

App renders are written to:

```text
out/app
```

## Asset Injection

Place `.svg` or `.png` files in:

```text
public/assets
```

Then run:

```bash
npm.cmd run batch:plan
```

This writes `src/generated/batch.ts`, creating one render configuration per asset and supported aspect ratio. For SVG files, path self-drawing is available when the SVG contains `<path>` elements.

## Render Props

The composition accepts:

- `format`: `16:9`, `9:16`, `4:3`, `2:3`
- `resolution`: `1080p`, `4k`
- `fps`: `24`, `30`, `60`
- `durationSeconds`: loop duration
- `asset`: SVG/PNG reference under `public`
- `material`: `neon`, `glass`, `liquidMetal`
- `forceField`: `vortex`, `inverseGravity`, `orbital`
- `compositionGrid`: `thirds`, `center`, `radial`
- `seed`, `particleCount`, `motionBlur`, `plexusDistance`, `shockwaveFrames`

## Looping

The shader, asset drift, fallback motion, and generated timeline are all tied to the composition duration. For strict seamless stock delivery, use durations where shockwave frames do not land near the final half-second unless the next loop begins with the same event timing.
