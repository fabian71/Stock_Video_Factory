export const loopProgress = (frame: number, durationInFrames: number) =>
  (frame % durationInFrames) / durationInFrames;

export const loopSine = (progress: number, phase = 0) =>
  Math.sin((progress + phase) * Math.PI * 2);

export const loopCosine = (progress: number, phase = 0) =>
  Math.cos((progress + phase) * Math.PI * 2);

export const mirroredPulse = (progress: number) =>
  1 - Math.abs(progress * 2 - 1);
