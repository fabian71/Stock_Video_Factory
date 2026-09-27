import chroma from 'chroma-js';
import {hashSeed, mulberry32, randomBetween} from '../utils/random';

export type FactoryPalette = {
  base: string;
  accent: string;
  secondary: string;
  backgroundA: string;
  backgroundB: string;
  glow: string;
  text: string;
};

export const createPalette = (seed: number, assetColor?: string): FactoryPalette => {
  const random = mulberry32(hashSeed(seed, 'palette'));
  const assetColorInput = assetColor ?? '';
  const base = chroma.valid(assetColorInput)
    ? chroma(assetColorInput)
    : chroma.hsl(randomBetween(random, 0, 360), 0.78, 0.56);
  const accent = base.set('hsl.h', `+${randomBetween(random, 70, 145)}`).saturate(0.4).brighten(0.2);
  const secondary = base.set('hsl.h', `-${randomBetween(random, 35, 80)}`).saturate(0.2);
  const backgroundA = chroma.mix(
    base.set('hsl.h', '+180').darken(2.8).desaturate(1.4),
    '#121722',
    0.58,
    'lab',
  );
  const backgroundB = chroma.mix(accent.darken(2.9).desaturate(1.1), '#24313a', 0.48, 'lab');

  return {
    base: base.hex(),
    accent: accent.hex(),
    secondary: secondary.hex(),
    backgroundA: backgroundA.hex(),
    backgroundB: backgroundB.hex(),
    glow: chroma.mix(base, 'white', 0.26, 'lab').hex(),
    text: chroma.contrast(base, '#ffffff') > 3 ? '#ffffff' : '#10131a',
  };
};

export const colorToVector = (color: string): [number, number, number] => {
  const [r, g, b] = chroma(color).rgb();
  return [r / 255, g / 255, b / 255];
};
