import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useEffect, useMemo, useState} from 'react';
import type {FactoryAsset, MaterialPreset} from '../types';
import type {FactoryPalette} from '../palette/palette';

type ParsedSvg = {
  viewBox: string;
  paths: string[];
};

const parseSvg = (svgText: string): ParsedSvg | null => {
  const document = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = document.querySelector('svg');
  if (!svg) {
    return null;
  }

  const viewBox = svg.getAttribute('viewBox') ?? '0 0 512 512';
  const paths = Array.from(svg.querySelectorAll('path'))
    .map((path) => path.getAttribute('d'))
    .filter((path): path is string => Boolean(path));

  return paths.length > 0 ? {viewBox, paths} : null;
};

const materialStyle = (material: MaterialPreset, palette: FactoryPalette, activation: number): React.CSSProperties => {
  if (material === 'glass') {
    return {
      filter: `drop-shadow(0 0 ${24 * activation}px ${palette.glow}) saturate(1.25)`,
      opacity: 0.72 + activation * 0.28,
      mixBlendMode: 'screen',
    };
  }

  if (material === 'liquidMetal') {
    return {
      filter: `drop-shadow(0 0 ${12 * activation}px ${palette.accent}) contrast(1.18) grayscale(0.28)`,
    };
  }

  return {
    filter: `drop-shadow(0 0 ${30 * activation}px ${palette.glow}) drop-shadow(0 0 ${70 * activation}px ${palette.base})`,
  };
};

export const SelfDrawingAsset = ({
  asset,
  palette,
  material,
  activationFrame,
}: {
  asset: FactoryAsset;
  palette: FactoryPalette;
  material: MaterialPreset;
  activationFrame: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const [parsed, setParsed] = useState<ParsedSvg | null>(null);
  const drawDuration = Math.round(fps * 1.2);
  const drawProgress = Math.min(1, frame / drawDuration);
  const activation = Math.max(0, Math.min(1, (frame - activationFrame) / (fps * 0.45)));

  useEffect(() => {
    if (asset.kind !== 'svg') {
      return;
    }

    let active = true;
    fetch(staticFile(asset.src.replace(/^\//, '')))
      .then((response) => response.text())
      .then((svgText) => {
        if (active) {
          setParsed(parseSvg(svgText));
        }
      })
      .catch(() => setParsed(null));

    return () => {
      active = false;
    };
  }, [asset.kind, asset.src]);

  const resolvedSrc = useMemo(() => staticFile(asset.src.replace(/^\//, '')), [asset.src]);

  if (asset.kind === 'svg' && parsed && drawProgress < 1) {
    return (
      <svg viewBox={parsed.viewBox} width="100%" height="100%" style={{overflow: 'visible'}}>
        {parsed.paths.map((path, index) => (
          <path
            // eslint-disable-next-line react/no-array-index-key
            key={`${asset.id}-${index}`}
            d={path}
            fill="none"
            stroke={palette.glow}
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - drawProgress}
            opacity={0.22 + drawProgress * 0.78}
          />
        ))}
      </svg>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt=""
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        ...materialStyle(material, palette, activation),
      }}
    />
  );
};
