import {mkdir} from 'node:fs/promises';
import path from 'node:path';
import {NextRequest, NextResponse} from 'next/server';
import {stockFactorySchema, type StockFactoryProps} from '../../../config/factoryConfig';

export const maxDuration = 300;

const serverImport = new Function('specifier', 'return import(specifier)') as <T>(specifier: string) => Promise<T>;

const varyProps = (base: StockFactoryProps, index: number): StockFactoryProps => ({
  ...base,
  seed: base.seed + index * 97,
  material: (['neon', 'glass', 'liquidMetal'] as const)[index % 3],
  forceField: (['vortex', 'inverseGravity', 'orbital'] as const)[index % 3],
  compositionGrid: (['thirds', 'center', 'radial'] as const)[index % 3],
  bgStyle: (['auroraFlow', 'liquidMetal', 'glassRefraction', 'neuralPlexus', 'holographicFoil', 'topographic', 'vortexTunnel', 'emberField'] as const)[index % 8],
  overlayStyle: (['embers', 'plexus', 'dataFlow', 'rings', 'prismEdges', 'luxuryBeams', 'rain', 'bokeh'] as const)[index % 8],
  colorRotation: base.colorRotation + index * 11,
  gradientAngle: (base.gradientAngle + index * 23) % 360,
  bandCount: Math.min(48, base.bandCount + (index % 6) * 3),
  complexity: Math.min(1, Number((base.complexity + (index % 5) * 0.07).toFixed(2))),
  distortion: Math.min(1, Number((base.distortion + (index % 4) * 0.06).toFixed(2))),
  particleCount: Math.min(220, base.particleCount + (index % 5) * 12),
  motionBlur: Math.min(1, Number((base.motionBlur + (index % 4) * 0.08).toFixed(2))),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = Math.max(1, Math.min(80, Number(body.count ?? 1)));
    const base = stockFactorySchema.parse(body.props);
    const outputDir = path.join(process.cwd(), 'out', 'app');
    await mkdir(outputDir, {recursive: true});
    const [{bundle}, {renderMedia, selectComposition}] = await Promise.all([
      serverImport<typeof import('@remotion/bundler')>('@remotion/bundler'),
      serverImport<typeof import('@remotion/renderer')>('@remotion/renderer'),
    ]);

    const serveUrl = await bundle({
      entryPoint: path.join(process.cwd(), 'src', 'index.ts'),
      webpackOverride: (config) => config,
    });

    const outputs: string[] = [];

    for (let index = 0; index < count; index += 1) {
      const inputProps = varyProps(base, index);
      const composition = await selectComposition({
        serveUrl,
        id: 'StockVideoFactory',
        inputProps,
      });
      const fileName = `${String(index + 1).padStart(3, '0')}-${inputProps.asset.id}-${inputProps.format.replace(':', 'x')}-${inputProps.resolution}.mp4`;
      const outputLocation = path.join(outputDir, fileName);

      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation,
        inputProps,
      });
      outputs.push(outputLocation);
    }

    return NextResponse.json({ok: true, outputs, outputDir});
  } catch (error) {
    return NextResponse.json(
      {ok: false, error: error instanceof Error ? error.message : String(error)},
      {status: 400},
    );
  }
}
