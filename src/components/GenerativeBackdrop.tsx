import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import type {StockFactoryProps} from '../config/factoryConfig';
import {hashSeed, mulberry32, randomBetween} from '../utils/random';
import {loopCosine, loopProgress, loopSine} from '../utils/loop';

type BackdropProps = {
  props: StockFactoryProps;
};

const colorAt = (colors: string[], index: number) => colors[index % colors.length] ?? '#ffffff';

const overlayColor = (props: StockFactoryProps, index = 1) => {
  if (props.overlayColorMode === 'white') {
    return '#ffffff';
  }
  if (props.overlayColorMode === 'secondary') {
    return colorAt(props.colors, 2);
  }
  if (props.overlayColorMode === 'rainbow') {
    return `hsl(${(props.gradientAngle + props.colorRotation + index * 47) % 360} 92% 68%)`;
  }
  if (props.overlayColorMode === 'asset') {
    return props.asset.dominantColor ?? colorAt(props.colors, 1);
  }
  return colorAt(props.colors, 1);
};

const backgroundCss = (props: StockFactoryProps, progress: number): React.CSSProperties => {
  const c0 = colorAt(props.colors, 0);
  const c1 = colorAt(props.colors, 1);
  const c2 = colorAt(props.colors, 2);
  const c3 = colorAt(props.colors, 3);
  const c4 = colorAt(props.colors, 4);
  const angle = props.gradientAngle + progress * props.speed * 80;
  const driftX = 50 + loopSine(progress, 0.1) * 18 * props.distortion;
  const driftY = 50 + loopCosine(progress, 0.25) * 18 * props.distortion;
  const zoom = `scale(${props.zoom})`;
  const base: React.CSSProperties = {
    transform: zoom,
    filter: `hue-rotate(${props.colorRotation + progress * props.speed * 80}deg) saturate(${1 + props.complexity * 0.55}) contrast(${1 + props.glowIntensity * 0.18})`,
  };

  switch (props.bgStyle) {
    case 'linear':
      return {
        ...base,
        background: `repeating-linear-gradient(${angle}deg, ${c0} 0%, ${c1} ${100 / props.bandCount}%, ${c2} ${200 / props.bandCount}%, ${c3} ${300 / props.bandCount}%)`,
      };
    case 'radial':
      return {
        ...base,
        background: `radial-gradient(circle at ${driftX}% ${driftY}%, ${c1}, transparent 28%), radial-gradient(circle at ${100 - driftX}% ${100 - driftY}%, ${c2}, transparent 34%), ${c0}`,
      };
    case 'conic':
      return {
        ...base,
        background: `conic-gradient(from ${angle}deg at ${driftX}% ${driftY}%, ${c0}, ${c1}, ${c2}, ${c3}, ${c0})`,
      };
    case 'auroraFlow':
      return {
        ...base,
        background: `radial-gradient(ellipse at ${driftX}% 18%, ${c1}cc, transparent 38%), radial-gradient(ellipse at 18% ${driftY}%, ${c2}aa, transparent 42%), linear-gradient(${angle}deg, ${c0}, ${c4}, #060914)`,
        filter: `${base.filter} blur(${8 + props.distortion * 18}px)`,
      };
    case 'liquidMetal':
    case 'metallicFlow':
      return {
        ...base,
        background: `linear-gradient(${angle}deg, #050505, ${c2}, #f5f7fb, ${c1}, #08080b), repeating-radial-gradient(circle at ${driftX}% ${driftY}%, #ffffff22 0 2px, transparent 4px 18px)`,
        mixBlendMode: 'normal',
      };
    case 'plasmaSheet':
    case 'fractalAbyss':
      return {
        ...base,
        background: `radial-gradient(circle at ${driftX}% ${driftY}%, ${c1}, transparent 24%), radial-gradient(circle at 70% 25%, ${c2}, transparent 34%), radial-gradient(circle at 40% 80%, ${c3}, transparent 32%), #03050d`,
        filter: `${base.filter} blur(${props.bgStyle === 'fractalAbyss' ? 2 : 14}px)`,
      };
    case 'velvetMesh':
    case 'silkRibbons':
      return {
        ...base,
        background: `repeating-linear-gradient(${angle}deg, ${c0} 0 12px, ${c1}44 18px, ${c2}66 28px), radial-gradient(circle at ${driftX}% ${driftY}%, ${c3}, transparent 46%)`,
        filter: `${base.filter} blur(${4 + props.distortion * 8}px)`,
      };
    case 'glassRefraction':
    case 'crystalSurface':
    case 'holographicFoil':
      return {
        ...base,
        background: `linear-gradient(${angle}deg, ${c0}, ${c1}88, ${c2}aa, ${c3}), repeating-conic-gradient(from ${angle}deg, #ffffff22 0deg 12deg, transparent 12deg 38deg)`,
      };
    case 'topographic':
    case 'moireSilk':
    case 'waveInterference':
      return {
        ...base,
        background: `repeating-radial-gradient(ellipse at ${driftX}% ${driftY}%, ${c1} 0 1px, transparent 2px ${12 - props.complexity * 7}px), linear-gradient(${angle}deg, ${c0}, ${c4})`,
      };
    case 'vortexTunnel':
    case 'radialTunnel':
      return {
        ...base,
        background: `repeating-radial-gradient(circle at 50% 50%, ${c1} 0 2px, transparent 8px ${18 - props.complexity * 9}px), conic-gradient(from ${angle}deg, ${c0}, ${c2}, ${c3}, ${c0})`,
      };
    case 'hexPulse':
    case 'dataGrid':
    case 'neuralPlexus':
      return {
        ...base,
        background: `linear-gradient(${angle}deg, ${c0}, #050914), radial-gradient(circle at ${driftX}% ${driftY}%, ${c1}99, transparent 32%)`,
      };
    case 'bokehDepth':
    case 'dustBloom':
      return {
        ...base,
        background: `radial-gradient(circle at 30% 35%, ${c1}88, transparent 18%), radial-gradient(circle at 72% 45%, ${c2}77, transparent 22%), radial-gradient(circle at 52% 70%, ${c3}55, transparent 26%), ${c0}`,
        filter: `${base.filter} blur(${props.bgStyle === 'bokehDepth' ? 10 : 4}px)`,
      };
    case 'emberField':
    case 'fireRibbon':
      return {
        ...base,
        background: `radial-gradient(circle at ${driftX}% ${80 - driftY * 0.25}%, #ffb454cc, transparent 22%), linear-gradient(${angle}deg, ${c0}, #2a0704, ${c3})`,
      };
    case 'rainStreaks':
    case 'snowField':
      return {
        ...base,
        background: `linear-gradient(${angle}deg, ${c0}, ${c4}), repeating-linear-gradient(${angle + 82}deg, #ffffff22 0 1px, transparent 1px ${props.bgStyle === 'rainStreaks' ? 18 : 34}px)`,
      };
    case 'bubbleRise':
    case 'causticLight':
      return {
        ...base,
        background: `radial-gradient(circle at ${driftX}% ${driftY}%, ${c1}88, transparent 26%), repeating-radial-gradient(circle at 50% 50%, #ffffff18 0 1px, transparent 8px 30px), linear-gradient(${angle}deg, ${c0}, ${c2})`,
      };
    case 'lowpolyShard':
    default:
      return {
        ...base,
        background: `conic-gradient(from ${angle}deg, ${c0}, ${c1}, ${c2}, ${c3}, ${c4}, ${c0})`,
      };
  }
};

const Grain = ({amount}: {amount: number}) => (
  <AbsoluteFill
    style={{
      opacity: amount,
      backgroundImage:
        'radial-gradient(circle at 20% 30%, #fff 0 1px, transparent 1px), radial-gradient(circle at 80% 70%, #fff 0 1px, transparent 1px)',
      backgroundSize: '13px 17px, 19px 23px',
      mixBlendMode: 'overlay',
    }}
  />
);

const PatternOverlay = ({props, progress}: {props: StockFactoryProps; progress: number}) => {
  if (props.overlayStyle === 'none') {
    return null;
  }

  const random = mulberry32(hashSeed(props.seed, `overlay-${props.overlayStyle}`));
  const color = overlayColor(props);
  const opacity = 0.16 + props.complexity * 0.42;
  const drift = progress * props.speed * 100;
  const items = Array.from({length: Math.min(180, Math.max(12, props.bandCount * 5))}, (_, index) => ({
    x: randomBetween(random, 0, 100),
    y: randomBetween(random, 0, 100),
    s: randomBetween(random, 0.35, 2.2),
    a: randomBetween(random, 0, 360),
  }));

  if (['scanlines', 'grid', 'hex', 'radialBands', 'topoLines'].includes(props.overlayStyle)) {
    const gridSize = props.overlayStyle === 'hex' ? 42 : 20 + (1 - props.complexity) * 36;
    return (
      <AbsoluteFill
        style={{
          opacity,
          background:
            props.overlayStyle === 'radialBands'
              ? `repeating-radial-gradient(circle, ${color} 0 1px, transparent 5px ${gridSize}px)`
              : props.overlayStyle === 'scanlines'
                ? `repeating-linear-gradient(0deg, ${color} 0 1px, transparent 1px ${gridSize}px)`
                : `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          transform: `translateY(${drift % gridSize}px)`,
          mixBlendMode: 'screen',
        }}
      />
    );
  }

  if (['luxuryBeams', 'glassPanels', 'prismEdges', 'glitch'].includes(props.overlayStyle)) {
    return (
      <AbsoluteFill
        style={{
          opacity: 0.18 + props.glowIntensity * 0.35,
          background:
            props.overlayStyle === 'glassPanels'
              ? `linear-gradient(${props.gradientAngle}deg, transparent 0 26%, ${color}22 27% 34%, transparent 35% 100%)`
              : `repeating-linear-gradient(${props.gradientAngle + 90}deg, transparent 0 8%, ${color}55 9% 10%, transparent 12% 24%)`,
          filter: `blur(${props.overlayStyle === 'glitch' ? 0 : 10}px)`,
          mixBlendMode: props.overlayStyle === 'glitch' ? 'difference' : 'screen',
          transform: `translateX(${loopSine(progress) * props.distortion * 60}px)`,
        }}
      />
    );
  }

  return (
    <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, opacity}}>
      {items.map((item, index) => {
        const y = (item.y + drift * (0.1 + item.s * 0.05)) % 112;
        if (['rings', 'bokeh', 'bubbles'].includes(props.overlayStyle)) {
          return (
            <circle
              key={index}
              cx={item.x * 10}
              cy={y * 10 - 60}
              r={(8 + item.s * 18) * (props.overlayStyle === 'bokeh' ? 2 : 1)}
              fill="none"
              stroke={overlayColor(props, index)}
              strokeWidth={props.overlayStyle === 'bokeh' ? 8 : 2}
              opacity={0.18 + item.s * 0.1}
              filter={`blur(${props.overlayStyle === 'bokeh' ? 8 : 0}px)`}
            />
          );
        }
        if (['rain', 'embers', 'sparks', 'snow', 'dust', 'particles'].includes(props.overlayStyle)) {
          return (
            <line
              key={index}
              x1={item.x * 10}
              y1={y * 10 - 80}
              x2={item.x * 10 + (props.overlayStyle === 'rain' ? 34 : loopSine(progress, item.s) * 18)}
              y2={y * 10 + (props.overlayStyle === 'rain' ? 84 : 12 + item.s * 10)}
              stroke={overlayColor(props, index)}
              strokeWidth={props.overlayStyle === 'snow' || props.overlayStyle === 'dust' ? item.s * 2 : item.s * 3}
              strokeLinecap="round"
              opacity={0.2 + item.s * 0.15}
              filter={`blur(${props.overlayStyle === 'embers' ? props.glowIntensity * 5 : 0}px)`}
            />
          );
        }
        return (
          <path
            key={index}
            d={`M ${item.x * 10} ${y * 10} C ${item.x * 10 + 80} ${y * 10 - 60} ${item.x * 10 + 160} ${y * 10 + 60} ${item.x * 10 + 240} ${y * 10}`}
            fill="none"
            stroke={overlayColor(props, index)}
            strokeWidth={1 + item.s}
            opacity={0.2}
          />
        );
      })}
    </svg>
  );
};

export const GenerativeBackdrop = ({props}: BackdropProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = loopProgress(frame, durationInFrames);
  const symmetryTransform =
    props.symmetry === 'mirrorX'
      ? 'scaleX(-1)'
      : props.symmetry === 'mirrorY'
        ? 'scaleY(-1)'
        : props.symmetry === 'quad'
          ? 'scale(1.08) rotate(90deg)'
          : props.symmetry === 'radial'
            ? `rotate(${progress * 360 * props.speed}deg)`
            : undefined;

  return (
    <AbsoluteFill style={{background: colorAt(props.colors, 0), overflow: 'hidden'}}>
      <AbsoluteFill style={backgroundCss(props, progress)} />
      {symmetryTransform ? <AbsoluteFill style={{...backgroundCss(props, progress), transform: symmetryTransform, opacity: 0.45, mixBlendMode: 'screen'}} /> : null}
      <PatternOverlay props={props} progress={progress} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, transparent 0 38%, rgba(0,0,0,${0.32 + props.glowIntensity * 0.08}) 100%)`,
          mixBlendMode: 'multiply',
        }}
      />
      <Grain amount={props.grain} />
    </AbsoluteFill>
  );
};
