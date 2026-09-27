import {z} from 'zod';

export const aspectRatioSchema = z.enum(['16:9', '9:16', '4:3', '2:3']);
export const resolutionSchema = z.enum(['4k', '1080p']);
export const materialSchema = z.enum(['neon', 'glass', 'liquidMetal']);
export const forceFieldSchema = z.enum(['vortex', 'inverseGravity', 'orbital']);
export const compositionGridSchema = z.enum(['thirds', 'center', 'radial']);
export const backgroundStyleValues = [
  'linear',
  'radial',
  'conic',
  'auroraFlow',
  'liquidMetal',
  'plasmaSheet',
  'velvetMesh',
  'glassRefraction',
  'holographicFoil',
  'crystalSurface',
  'topographic',
  'moireSilk',
  'waveInterference',
  'vortexTunnel',
  'radialTunnel',
  'hexPulse',
  'lowpolyShard',
  'dataGrid',
  'neuralPlexus',
  'bokehDepth',
  'dustBloom',
  'emberField',
  'rainStreaks',
  'snowField',
  'bubbleRise',
  'causticLight',
  'fireRibbon',
  'silkRibbons',
  'fractalAbyss',
  'metallicFlow',
] as const;
export const overlayStyleValues = [
  'none',
  'embers',
  'plexus',
  'scanlines',
  'dust',
  'bokeh',
  'dataFlow',
  'grid',
  'rings',
  'crosshair',
  'prismEdges',
  'glitch',
  'particles',
  'rain',
  'snow',
  'bubbles',
  'sparks',
  'topoLines',
  'hex',
  'radialBands',
  'luxuryBeams',
  'glassPanels',
] as const;
export const overlayColorModeValues = ['white', 'accent', 'secondary', 'rainbow', 'asset'] as const;
export const symmetryValues = ['none', 'mirrorX', 'mirrorY', 'quad', 'radial'] as const;

export const backgroundStyleSchema = z.enum(backgroundStyleValues);
export const overlayStyleSchema = z.enum(overlayStyleValues);
export const overlayColorModeSchema = z.enum(overlayColorModeValues);
export const symmetrySchema = z.enum(symmetryValues);

export const assetSchema = z.object({
  id: z.string(),
  src: z.string(),
  kind: z.enum(['svg', 'png']),
  dominantColor: z.string().optional(),
});

export const stockFactorySchema = z.object({
  seed: z.number().int(),
  fps: z.union([z.literal(24), z.literal(30), z.literal(60)]),
  durationSeconds: z.number().int().min(3).max(60),
  resolution: resolutionSchema,
  format: aspectRatioSchema,
  asset: assetSchema,
  assetEnabled: z.boolean().default(true),
  assetScale: z.number().min(0.2).max(2.4).default(1),
  assetOpacity: z.number().min(0).max(1).default(1),
  assetEffectIntensity: z.number().min(0).max(1.5).default(0.75),
  seamlessLoop: z.boolean().default(true),
  material: materialSchema,
  forceField: forceFieldSchema,
  compositionGrid: compositionGridSchema,
  bgStyle: backgroundStyleSchema.default('auroraFlow'),
  overlayStyle: overlayStyleSchema.default('embers'),
  overlayColorMode: overlayColorModeSchema.default('accent'),
  colors: z.array(z.string()).min(3).max(6).default(['#3e040a', '#4bd83b', '#abb3f7', '#e7de8d', '#043934']),
  speed: z.number().min(0).max(3).default(1),
  complexity: z.number().min(0).max(1).default(0.45),
  distortion: z.number().min(0).max(1).default(0.28),
  grain: z.number().min(0).max(0.35).default(0.06),
  gradientAngle: z.number().min(0).max(360).default(18),
  bandCount: z.number().int().min(2).max(48).default(12),
  glowIntensity: z.number().min(0).max(1.5).default(0.42),
  zoom: z.number().min(0.5).max(2.5).default(1),
  colorRotation: z.number().min(-180).max(180).default(0),
  symmetry: symmetrySchema.default('none'),
  particleCount: z.number().int().min(0).max(240),
  motionBlur: z.number().min(0).max(1),
  plexusDistance: z.number().min(0.05).max(0.6),
  shockwaveFrames: z.array(z.number().int().min(0)).default([]),
});

export type AspectRatio = z.infer<typeof aspectRatioSchema>;
export type Resolution = z.infer<typeof resolutionSchema>;
export type StockFactoryProps = z.infer<typeof stockFactorySchema>;

export const DEFAULT_FACTORY_PROPS: StockFactoryProps = {
  seed: 2107,
  fps: 30,
  durationSeconds: 8,
  resolution: '1080p',
  format: '16:9',
  asset: {
    id: 'caution-bolt',
    src: '/assets/caution-bolt.svg',
    kind: 'svg',
    dominantColor: '#ffd84d',
  },
  assetEnabled: true,
  assetScale: 1,
  assetOpacity: 1,
  assetEffectIntensity: 0.75,
  seamlessLoop: true,
  material: 'neon',
  forceField: 'vortex',
  compositionGrid: 'thirds',
  bgStyle: 'auroraFlow',
  overlayStyle: 'embers',
  overlayColorMode: 'accent',
  colors: ['#3e040a', '#4bd83b', '#abb3f7', '#e7de8d', '#043934'],
  speed: 1,
  complexity: 0.45,
  distortion: 0.28,
  grain: 0.06,
  gradientAngle: 18,
  bandCount: 12,
  glowIntensity: 0.42,
  zoom: 1,
  colorRotation: 0,
  symmetry: 'none',
  particleCount: 96,
  motionBlur: 0.55,
  plexusDistance: 0.24,
  shockwaveFrames: [90, 180],
};

export const formatToDimensions = (format: AspectRatio, resolution: Resolution) => {
  const longEdge = resolution === '4k' ? 3840 : 1920;
  const shortEdge = resolution === '4k' ? 2160 : 1080;

  if (format === '16:9') {
    return {width: longEdge, height: shortEdge};
  }

  if (format === '9:16') {
    return {width: shortEdge, height: longEdge};
  }

  if (format === '4:3') {
    return resolution === '4k'
      ? {width: 2880, height: 2160}
      : {width: 1440, height: 1080};
  }

  return resolution === '4k'
    ? {width: 1440, height: 2160}
    : {width: 720, height: 1080};
};
