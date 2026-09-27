import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const entryPoint = new URL('../src/index.ts', import.meta.url).pathname;
const outDir = new URL('../out/batch/', import.meta.url).pathname;
const batchModule = await import(pathToFileURL(new URL('../src/generated/batch.ts', import.meta.url).pathname));

await mkdir(outDir, {recursive: true});

const serveUrl = await bundle({
  entryPoint,
  webpackOverride: (config) => config,
});

for (const [index, inputProps] of batchModule.batchPlan.entries()) {
  const composition = await selectComposition({
    serveUrl,
    id: 'StockVideoFactory',
    inputProps,
  });

  const outputLocation = join(
    outDir,
    `${String(index + 1).padStart(3, '0')}-${inputProps.asset.id}-${inputProps.format.replace(':', 'x')}-${inputProps.resolution}.mp4`,
  );

  console.log(`Rendering ${outputLocation}`);
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
  });
}
