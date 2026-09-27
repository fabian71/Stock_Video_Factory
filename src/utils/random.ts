export type RandomSource = () => number;

export const hashSeed = (seed: number, salt: string) => {
  let hash = seed ^ 0x811c9dc5;
  for (let i = 0; i < salt.length; i++) {
    hash ^= salt.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const mulberry32 = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomBetween = (random: RandomSource, min: number, max: number) =>
  min + (max - min) * random();

export const pick = <T,>(random: RandomSource, values: T[]) =>
  values[Math.floor(random() * values.length) % values.length];
