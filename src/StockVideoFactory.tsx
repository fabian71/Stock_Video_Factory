import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {useMemo} from 'react';
import {stockFactorySchema, type StockFactoryProps} from './config/factoryConfig';
import {createPalette} from './palette/palette';
import {pickAnchor} from './composition/grids';
import {useRapierTimeline} from './physics/rapierTimeline';
import {GenerativeBackdrop} from './components/GenerativeBackdrop';
import {ParticleLayer} from './components/ParticleLayer';
import {PlexusLayer} from './components/PlexusLayer';
import {SelfDrawingAsset} from './components/SelfDrawingAsset';
import {loopProgress, mirroredPulse} from './utils/loop';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const activationFrameFor = (fps: number) => Math.round(fps * 1.2);

const assetMaterialFrameStyle = ({
  x,
  y,
  rotation,
  speed,
  progress,
  motionBlur,
  assetScale,
}: {
  x: number;
  y: number;
  rotation: number;
  speed: number;
  progress: number;
  motionBlur: number;
  assetScale: number;
}): React.CSSProperties => {
  const loopBreath = 1 + mirroredPulse(progress) * 0.025;
  const blur = clamp(speed * motionBlur * 0.7, 0, 14);
  return {
    position: 'absolute',
    left: `${(0.5 + x * 0.5) * 100}%`,
    top: `${(0.5 + y * 0.5) * 100}%`,
    width: `min(${36 * assetScale}vmin, ${560 * assetScale}px)`,
    aspectRatio: '1 / 1',
    transform: `translate(-50%, -50%) rotate(${rotation}rad) scale(${loopBreath})`,
    filter: `blur(${blur}px)`,
  };
};

export const StockVideoFactory = (rawProps: StockFactoryProps) => {
  const props = stockFactorySchema.parse(rawProps);
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const progress = loopProgress(frame, durationInFrames);
  const palette = useMemo(
    () => createPalette(props.seed, props.asset.dominantColor),
    [props.asset.dominantColor, props.seed],
  );
  const anchor = useMemo(
    () => pickAnchor(props.compositionGrid, props.seed),
    [props.compositionGrid, props.seed],
  );
  const timeline = useRapierTimeline({
    seed: props.seed,
    fps,
    durationInFrames,
    particleCount: props.particleCount,
    forceField: props.forceField,
    shockwaveFrames: props.shockwaveFrames,
    anchor,
  });

  const fallbackFrame = {
    asset: {
      id: 'asset',
      x: anchor.x,
      y: anchor.y,
      z: 0,
      rotation: 0,
      radius: 0.18,
      speed: 0,
    },
    particles: [],
  };
  const physics = timeline?.[frame % durationInFrames] ?? fallbackFrame;
  const activationFrame = activationFrameFor(fps);
  const materialized = props.assetEnabled ? frame >= activationFrame : true;
  const materialOpacity = interpolate(frame, [activationFrame - 8, activationFrame + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: palette.backgroundA, overflow: 'hidden'}}>
      <GenerativeBackdrop props={props} />

      <AbsoluteFill style={{opacity: 0.95}}>
        <ParticleLayer
          particles={physics.particles}
          palette={palette}
          front={false}
          motionBlur={props.motionBlur}
        />
      </AbsoluteFill>

      {materialized ? (
        <PlexusLayer
          bodies={[physics.asset, ...physics.particles.filter((_, index) => index % 2 === 0)]}
          palette={palette}
          maxDistance={props.plexusDistance}
        />
      ) : null}

      {props.assetEnabled ? (
        <div
          style={{
            ...assetMaterialFrameStyle({
              ...physics.asset,
              progress,
              motionBlur: props.motionBlur * props.assetEffectIntensity,
              assetScale: props.assetScale,
            }),
            opacity: props.assetOpacity * (frame < activationFrame ? 1 : materialOpacity),
          }}
        >
          <SelfDrawingAsset
            asset={props.asset}
            palette={palette}
            material={props.material}
            activationFrame={activationFrame}
          />
        </div>
      ) : null}

      <ParticleLayer
        particles={physics.particles}
        palette={palette}
        front
        motionBlur={props.motionBlur}
      />

      {props.shockwaveFrames.map((shockFrame) => {
        const age = frame - shockFrame;
        if (age < 0 || age > fps * 0.7) {
          return null;
        }

        const shockProgress = age / (fps * 0.7);
        const size = interpolate(shockProgress, [0, 1], [10, 165], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={shockFrame}
            style={{
              position: 'absolute',
              left: `${(0.5 + physics.asset.x * 0.5) * 100}%`,
              top: `${(0.5 + physics.asset.y * 0.5) * 100}%`,
              width: `${size}vmin`,
              height: `${size}vmin`,
              borderRadius: '50%',
              border: `2px solid ${palette.glow}`,
              transform: 'translate(-50%, -50%)',
              opacity: (1 - shockProgress) * 0.5,
              filter: `blur(${shockProgress * 8}px)`,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
