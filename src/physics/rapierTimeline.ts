import {continueRender, delayRender} from 'remotion';
import {useEffect, useMemo, useState} from 'react';
import type {RigidBody} from '@dimforge/rapier2d-compat';
import type {BodyState, ForceField} from '../types';
import {hashSeed, mulberry32, randomBetween} from '../utils/random';
import {loopCosine, loopSine} from '../utils/loop';

type RapierModule = typeof import('@dimforge/rapier2d-compat');

export type PhysicsFrame = {
  asset: BodyState;
  particles: BodyState[];
};

export type PhysicsTimelineOptions = {
  seed: number;
  fps: number;
  durationInFrames: number;
  particleCount: number;
  forceField: ForceField;
  shockwaveFrames: number[];
  anchor: {x: number; y: number};
};

const worldScale = 9;

const shockwaveStrength = (frame: number, shockwaveFrames: number[]) => {
  let strength = 0;
  for (const shockFrame of shockwaveFrames) {
    const distance = Math.abs(frame - shockFrame);
    if (distance < 22) {
      strength += (1 - distance / 22) * 7.5;
    }
  }
  return strength;
};

const createFallbackTimeline = (options: PhysicsTimelineOptions): PhysicsFrame[] => {
  const random = mulberry32(hashSeed(options.seed, 'fallback-physics'));

  const particles = Array.from({length: options.particleCount}, (_, index) => ({
    id: `particle-${index}`,
    orbit: randomBetween(random, 0.7, 4.2),
    phase: randomBetween(random, 0, 1),
    tilt: randomBetween(random, -0.38, 0.38),
    radius: randomBetween(random, 0.018, 0.05),
    z: randomBetween(random, -1, 1),
  }));

  return Array.from({length: options.durationInFrames}, (_, frame) => {
    const progress = frame / options.durationInFrames;
    const wave = shockwaveStrength(frame, options.shockwaveFrames);
    const assetX = options.anchor.x + loopSine(progress, 0.08) * 0.08;
    const assetY = options.anchor.y + loopCosine(progress, 0.21) * 0.05;

    return {
      asset: {
        id: 'asset',
        x: assetX,
        y: assetY,
        z: 0,
        rotation: loopSine(progress, 0.16) * 0.18,
        radius: 0.18,
        speed: 0.25 + wave,
      },
      particles: particles.map((particle) => {
        const forceBias = options.forceField === 'inverseGravity' ? -0.12 : options.forceField === 'orbital' ? 0.18 : 0;
        const orbit = particle.orbit + wave * 0.02;
        const angle = (progress + particle.phase) * Math.PI * 2;
        return {
          id: particle.id,
          x: assetX + Math.cos(angle * orbit) * (0.22 + particle.z * 0.08 + wave * 0.018),
          y: assetY + Math.sin(angle * (orbit + particle.tilt)) * (0.22 + forceBias + wave * 0.014),
          z: particle.z,
          rotation: angle,
          radius: particle.radius,
          speed: Math.abs(orbit) + wave,
        };
      }),
    };
  });
};

const bodyState = (id: string, body: RigidBody, radius: number, z: number): BodyState => {
  const translation = body.translation();
  const velocity = body.linvel();
  return {
    id,
    x: translation.x / worldScale,
    y: translation.y / worldScale,
    z,
    rotation: body.rotation(),
    radius,
    speed: Math.hypot(velocity.x, velocity.y),
  };
};

const applyFieldImpulse = (
  body: RigidBody,
  field: ForceField,
  frame: number,
  durationInFrames: number,
  shock: number,
) => {
  const translation = body.translation();
  const progress = frame / durationInFrames;
  const tangent = {x: -translation.y, y: translation.x};
  const distance = Math.max(0.4, Math.hypot(translation.x, translation.y));

  if (field === 'vortex') {
    body.addForce({x: tangent.x * 0.018, y: tangent.y * 0.018}, true);
  }

  if (field === 'inverseGravity') {
    body.addForce({x: loopSine(progress) * 0.12, y: -0.16}, true);
  }

  if (field === 'orbital') {
    body.addForce({x: tangent.x * 0.014 - translation.x * 0.006, y: tangent.y * 0.014 - translation.y * 0.006}, true);
  }

  if (shock > 0) {
    body.applyImpulse(
      {
        x: (translation.x / distance) * shock * 0.045,
        y: (translation.y / distance) * shock * 0.045,
      },
      true,
    );
  }
};

export const createRapierTimeline = async (options: PhysicsTimelineOptions): Promise<PhysicsFrame[]> => {
  if (typeof window !== 'undefined') {
    return createFallbackTimeline(options);
  }

  let rapier: RapierModule;
  try {
    rapier = await import('@dimforge/rapier2d-compat');
    await rapier.init();
  } catch {
    return createFallbackTimeline(options);
  }

  try {
    const random = mulberry32(hashSeed(options.seed, 'rapier-physics'));
    const gravity = options.forceField === 'inverseGravity' ? {x: 0, y: -0.18} : {x: 0, y: 0.12};
    const world = new rapier.World(gravity);
    world.timestep = 1 / options.fps;

    const assetBody = world.createRigidBody(
      rapier.RigidBodyDesc.dynamic()
        .setTranslation(options.anchor.x * worldScale, options.anchor.y * worldScale)
        .setLinearDamping(0.85)
        .setAngularDamping(0.78),
    );
    world.createCollider(rapier.ColliderDesc.ball(1.05).setRestitution(0.88).setFriction(0.22), assetBody);

    const particleBodies = Array.from({length: options.particleCount}, (_, index) => {
      const angle = randomBetween(random, 0, Math.PI * 2);
      const radius = randomBetween(random, 1.8, 4.9);
      const body = world.createRigidBody(
        rapier.RigidBodyDesc.dynamic()
          .setTranslation(
            options.anchor.x * worldScale + Math.cos(angle) * radius,
            options.anchor.y * worldScale + Math.sin(angle) * radius,
          )
          .setLinvel(-Math.sin(angle) * randomBetween(random, 0.4, 1.6), Math.cos(angle) * randomBetween(random, 0.4, 1.6))
          .setLinearDamping(0.24)
          .setAngularDamping(0.4),
      );
      const particleRadius = randomBetween(random, 0.08, 0.22);
      world.createCollider(
        rapier.ColliderDesc.ball(particleRadius).setDensity(randomBetween(random, 0.35, 1.8)).setRestitution(0.72),
        body,
      );

      return {
        id: `particle-${index}`,
        body,
        radius: particleRadius / worldScale,
        z: randomBetween(random, -1, 1),
      };
    });

    const frames: PhysicsFrame[] = [];

    for (let frame = 0; frame < options.durationInFrames; frame++) {
      const progress = frame / options.durationInFrames;
      const loopPull = {
        x: options.anchor.x * worldScale + loopSine(progress, 0.08) * 0.72,
        y: options.anchor.y * worldScale + loopCosine(progress, 0.21) * 0.48,
      };
      const currentAsset = assetBody.translation();
      assetBody.addForce(
        {
          x: (loopPull.x - currentAsset.x) * 0.22,
          y: (loopPull.y - currentAsset.y) * 0.22,
        },
        true,
      );

      const shock = shockwaveStrength(frame, options.shockwaveFrames);
      for (const particle of particleBodies) {
        applyFieldImpulse(particle.body, options.forceField, frame, options.durationInFrames, shock);
      }
      if (shock > 0) {
        assetBody.applyTorqueImpulse(shock * 0.01, true);
      }

      world.step();

      frames.push({
        asset: bodyState('asset', assetBody, 0.18, 0),
        particles: particleBodies.map((particle) => bodyState(particle.id, particle.body, particle.radius, particle.z)),
      });
    }

    return frames;
  } catch {
    return createFallbackTimeline(options);
  }
};

export const useRapierTimeline = (options: PhysicsTimelineOptions) => {
  const [timeline, setTimeline] = useState<PhysicsFrame[] | null>(null);
  const key = useMemo(() => JSON.stringify(options), [options]);

  useEffect(() => {
    const handle = delayRender('Creating deterministic Rapier physics timeline');
    let active = true;

    createRapierTimeline(options)
      .then((nextTimeline) => {
        if (active) {
          setTimeline(nextTimeline);
        }
      })
      .finally(() => continueRender(handle));

    return () => {
      active = false;
    };
  }, [key]);

  return timeline;
};
