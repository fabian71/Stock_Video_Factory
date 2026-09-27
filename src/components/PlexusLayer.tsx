import type {BodyState} from '../types';
import type {FactoryPalette} from '../palette/palette';

const toScreen = (body: BodyState, width: number, height: number) => ({
  x: width * (0.5 + body.x * 0.5),
  y: height * (0.5 + body.y * 0.5),
});

export const PlexusLayer = ({
  bodies,
  palette,
  maxDistance,
}: {
  bodies: BodyState[];
  palette: FactoryPalette;
  maxDistance: number;
}) => {
  const lines = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < maxDistance) {
        lines.push({a, b, distance});
      }
    }
  }

  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
      {lines.slice(0, 220).map(({a, b, distance}) => {
        const start = toScreen(a, 1000, 1000);
        const end = toScreen(b, 1000, 1000);
        const opacity = Math.max(0, 1 - distance / maxDistance) * 0.42;
        return (
          <line
            key={`${a.id}-${b.id}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={palette.glow}
            strokeWidth={1.2}
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
};
