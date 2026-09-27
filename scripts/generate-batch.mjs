import {readdir, mkdir, writeFile} from 'node:fs/promises';
import {extname, join, basename} from 'node:path';

const assetDir = new URL('../public/assets/', import.meta.url);
const outFile = new URL('../src/generated/batch.ts', import.meta.url);

const formats = ['16:9', '9:16', '4:3', '2:3'];
const materials = ['neon', 'glass', 'liquidMetal'];
const forceFields = ['vortex', 'inverseGravity', 'orbital'];
const grids = ['thirds', 'center', 'radial'];
const backgrounds = ['auroraFlow', 'liquidMetal', 'glassRefraction', 'neuralPlexus', 'holographicFoil', 'topographic', 'vortexTunnel', 'emberField'];
const overlays = ['embers', 'plexus', 'dataFlow', 'rings', 'prismEdges', 'luxuryBeams', 'rain', 'bokeh'];
const paletteHints = ['#ffd84d', '#43f0b5', '#66a6ff', '#ff4f8b', '#f5f7fb'];

const files = (await readdir(assetDir)).filter((file) => ['.svg', '.png'].includes(extname(file).toLowerCase()));

const plans = files.flatMap((file, fileIndex) =>
  formats.map((format, formatIndex) => {
    const seed = 2107 + fileIndex * 100 + formatIndex;
    return {
      seed,
      fps: formatIndex % 2 === 0 ? 30 : 60,
      durationSeconds: 8,
      resolution: formatIndex === 1 ? '4k' : '1080p',
      format,
      asset: {
        id: basename(file, extname(file)),
        src: `/assets/${file}`,
        kind: extname(file).toLowerCase() === '.svg' ? 'svg' : 'png',
        dominantColor: paletteHints[(fileIndex + formatIndex) % paletteHints.length],
      },
      assetEnabled: true,
      assetScale: 1,
      assetOpacity: 1,
      assetEffectIntensity: 0.75,
      seamlessLoop: true,
      material: materials[(fileIndex + formatIndex) % materials.length],
      forceField: forceFields[(fileIndex + formatIndex) % forceFields.length],
      compositionGrid: grids[(fileIndex + formatIndex) % grids.length],
      bgStyle: backgrounds[(fileIndex + formatIndex) % backgrounds.length],
      overlayStyle: overlays[(fileIndex + formatIndex) % overlays.length],
      overlayColorMode: formatIndex % 2 === 0 ? 'accent' : 'rainbow',
      colors: ['#07131b', paletteHints[(fileIndex + formatIndex) % paletteHints.length], '#93c5fd', '#f4cdef', '#043934'],
      speed: 0.55 + formatIndex * 0.18,
      complexity: 0.34 + ((fileIndex + formatIndex) % 5) * 0.08,
      distortion: 0.12 + ((fileIndex + formatIndex) % 4) * 0.08,
      grain: 0.03 + ((fileIndex + formatIndex) % 4) * 0.02,
      gradientAngle: (fileIndex * 41 + formatIndex * 23) % 360,
      bandCount: 8 + ((fileIndex + formatIndex) % 8) * 3,
      glowIntensity: 0.28 + ((fileIndex + formatIndex) % 5) * 0.1,
      zoom: 0.9 + ((fileIndex + formatIndex) % 4) * 0.08,
      colorRotation: -24 + ((fileIndex + formatIndex) % 7) * 8,
      symmetry: formatIndex === 3 ? 'quad' : 'none',
      particleCount: 84 + ((fileIndex + formatIndex) % 4) * 24,
      motionBlur: 0.35 + ((fileIndex + formatIndex) % 4) * 0.12,
      plexusDistance: 0.18 + ((fileIndex + formatIndex) % 3) * 0.03,
      shockwaveFrames: [90, 180],
    };
  }),
);

await mkdir(new URL('../src/generated/', import.meta.url), {recursive: true});
await writeFile(
  outFile,
  `import type {StockFactoryProps} from '../config/factoryConfig';\n\nexport const batchPlan: StockFactoryProps[] = ${JSON.stringify(plans, null, 2)};\n`,
);

console.log(`Generated ${plans.length} render configs from ${files.length} assets.`);
