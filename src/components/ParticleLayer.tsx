import type {BodyState} from '../types';
import type {FactoryPalette} from '../palette/palette';

const depthScale = (z: number) => 0.65 + (z + 1) * 0.34;

export const ParticleLayer = ({
  particles,
  palette,
  front,
  motionBlur,
}: {
  particles: BodyState[];
  palette: FactoryPalette;
  front: boolean;
  motionBlur: number;
}) => {
  const filtered = particles.filter((particle) => (front ? particle.z >= 0 : particle.z < 0));

  return (
    <>
      {filtered.map((particle) => {
        const size = 22 + particle.radius * 820 * depthScale(particle.z);
        const blur = front ? Math.max(0, (1 - particle.z) * 2.5) : Math.max(1.5, Math.abs(particle.z) * 7);
        const blurTrail = Math.min(particle.speed * motionBlur * 0.18, 0.8);
        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${(0.5 + particle.x * 0.5) * 100}%`,
              top: `${(0.5 + particle.y * 0.5) * 100}%`,
              width: size,
              height: size,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) rotate(${particle.rotation}rad) scaleX(${1 + blurTrail})`,
              background: front
                ? `radial-gradient(circle, ${palette.glow}, ${palette.accent} 42%, transparent 68%)`
                : `radial-gradient(circle, ${palette.secondary}, transparent 64%)`,
              filter: `blur(${blur + blurTrail}px)`,
              opacity: front ? 0.34 : 0.22,
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </>
  );
};
