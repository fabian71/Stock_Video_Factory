import {CompositionGrid} from '../types';
import {hashSeed, mulberry32, pick, randomBetween} from '../utils/random';

export type NormalizedPoint = {x: number; y: number};

export const pickAnchor = (grid: CompositionGrid, seed: number): NormalizedPoint => {
  const random = mulberry32(hashSeed(seed, `grid-${grid}`));

  if (grid === 'center') {
    return {
      x: randomBetween(random, -0.08, 0.08),
      y: randomBetween(random, -0.08, 0.08),
    };
  }

  if (grid === 'radial') {
    const angle = randomBetween(random, 0, Math.PI * 2);
    const radius = randomBetween(random, 0.08, 0.18);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  }

  return pick(random, [
    {x: -1 / 3, y: -1 / 3},
    {x: 1 / 3, y: -1 / 3},
    {x: -1 / 3, y: 1 / 3},
    {x: 1 / 3, y: 1 / 3},
  ]);
};
