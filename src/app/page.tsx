'use client';

import dynamic from 'next/dynamic';
import type {ComponentType} from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {StockVideoFactory} from '../StockVideoFactory';
import {
  DEFAULT_FACTORY_PROPS,
  backgroundStyleValues,
  formatToDimensions,
  overlayColorModeValues,
  overlayStyleValues,
  symmetryValues,
  type AspectRatio,
  type Resolution,
  type StockFactoryProps,
} from '../config/factoryConfig';
import {factoryPresets} from '../config/presets';
import type {FactoryAsset} from '../types';

const Player = dynamic(() => import('@remotion/player').then((mod) => mod.Player), {
  ssr: false,
});
const PreviewComposition = StockVideoFactory as ComponentType<Record<string, unknown>>;

const formats: AspectRatio[] = ['16:9', '9:16', '4:3', '2:3'];
const resolutions: Resolution[] = ['1080p', '4k'];
const fpsValues = [24, 30, 60] as const;
const materials = ['neon', 'glass', 'liquidMetal'] as const;
const forceFields = ['vortex', 'inverseGravity', 'orbital'] as const;
const grids = ['thirds', 'center', 'radial'] as const;
const paletteBank = [
  ['#07131b', '#00c2ff', '#93c5fd', '#10b981', '#dbeafe'],
  ['#160d13', '#f4cdef', '#d6e27e', '#fdba74', '#ffffff'],
  ['#050818', '#22d3ee', '#6366f1', '#f472b6', '#fef08a'],
  ['#08161a', '#86efac', '#7dd3fc', '#f9a8d4', '#f8fafc'],
  ['#12070d', '#ff4f8b', '#7c3aed', '#22d3ee', '#facc15'],
  ['#030712', '#e5e7eb', '#94a3b8', '#38bdf8', '#111827'],
];

type Status = 'idle' | 'uploading' | 'rendering' | 'done' | 'error';

export default function Home() {
  const [props, setProps] = useState<StockFactoryProps>(DEFAULT_FACTORY_PROPS);
  const [assets, setAssets] = useState<FactoryAsset[]>([DEFAULT_FACTORY_PROPS.asset]);
  const [activePanel, setActivePanel] = useState<'scene' | 'style' | 'motion' | 'assets' | 'render'>('style');
  const [batchCount, setBatchCount] = useState(8);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('Ready');
  const [outputs, setOutputs] = useState<string[]>([]);

  const dimensions = useMemo(() => formatToDimensions(props.format, props.resolution), [props.format, props.resolution]);
  const durationInFrames = props.durationSeconds * props.fps;
  const previewScale = props.format === '9:16' || props.format === '2:3' ? 'portrait' : 'landscape';

  const set = useCallback(<K extends keyof StockFactoryProps>(key: K, value: StockFactoryProps[K]) => {
    setProps((current) => ({...current, [key]: value}));
  }, []);

  const randomizeColors = useCallback(() => {
    const palette = paletteBank[Math.floor(Math.random() * paletteBank.length)];
    const rotated = palette.map((color, index) => palette[(index + Math.floor(Math.random() * palette.length)) % palette.length]);
    setProps((current) => ({
      ...current,
      colors: rotated,
      asset: {...current.asset, dominantColor: rotated[1]},
      colorRotation: Math.round(Math.random() * 120 - 60),
    }));
  }, []);

  const randomizeVisual = useCallback(() => {
    const bgStyle = backgroundStyleValues[Math.floor(Math.random() * backgroundStyleValues.length)];
    const overlayStyle = overlayStyleValues[Math.floor(Math.random() * overlayStyleValues.length)];
    const palette = paletteBank[Math.floor(Math.random() * paletteBank.length)];
    setProps((current) => ({
      ...current,
      seed: Math.floor(Math.random() * 900000) + 1000,
      bgStyle,
      overlayStyle,
      overlayColorMode: overlayColorModeValues[Math.floor(Math.random() * overlayColorModeValues.length)],
      colors: palette,
      asset: {...current.asset, dominantColor: palette[1]},
      material: materials[Math.floor(Math.random() * materials.length)],
      forceField: forceFields[Math.floor(Math.random() * forceFields.length)],
      compositionGrid: grids[Math.floor(Math.random() * grids.length)],
      speed: Number((0.25 + Math.random() * 1.65).toFixed(2)),
      complexity: Number((0.18 + Math.random() * 0.72).toFixed(2)),
      distortion: Number((Math.random() * 0.82).toFixed(2)),
      grain: Number((Math.random() * 0.16).toFixed(2)),
      gradientAngle: Math.floor(Math.random() * 360),
      bandCount: Math.floor(4 + Math.random() * 34),
      glowIntensity: Number((0.12 + Math.random() * 0.95).toFixed(2)),
      zoom: Number((0.78 + Math.random() * 0.72).toFixed(2)),
      colorRotation: Math.round(Math.random() * 160 - 80),
      symmetry: symmetryValues[Math.floor(Math.random() * symmetryValues.length)],
      particleCount: Math.floor(42 + Math.random() * 150),
      motionBlur: Number((0.18 + Math.random() * 0.62).toFixed(2)),
      plexusDistance: Number((0.12 + Math.random() * 0.26).toFixed(2)),
    }));
  }, []);

  const refreshAssets = useCallback(async () => {
    const response = await fetch('/api/assets');
    const data = await response.json();
    if (data.ok && data.assets.length > 0) {
      setAssets(data.assets);
      setProps((current) => ({
        ...current,
        asset: data.assets.some((asset: FactoryAsset) => asset.src === current.asset.src) ? current.asset : data.assets[0],
      }));
    }
  }, []);

  useEffect(() => {
    refreshAssets().catch(() => undefined);
  }, [refreshAssets]);

  const uploadAssets = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setStatus('uploading');
    setMessage('Uploading assets...');
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    const response = await fetch('/api/assets', {method: 'POST', body: formData});
    const data = await response.json();

    if (!data.ok) {
      setStatus('error');
      setMessage(data.error ?? 'Upload failed');
      return;
    }

    await refreshAssets();
    setProps((current) => ({...current, asset: data.assets[0]}));
    setStatus('done');
    setMessage(`${data.assets.length} asset(s) added`);
  };

  const render = async (count: number) => {
    setStatus('rendering');
    setMessage(count === 1 ? 'Rendering single video...' : `Rendering ${count} videos...`);
    setOutputs([]);
    const response = await fetch('/api/render', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({props, count}),
    });
    const data = await response.json();

    if (!data.ok) {
      setStatus('error');
      setMessage(data.error ?? 'Render failed');
      return;
    }

    setOutputs(data.outputs);
    setStatus('done');
    setMessage(`Rendered ${data.outputs.length} file(s) in ${data.outputDir}`);
  };

  return (
    <main className="appShell">
      <header className="topBar">
        <div>
          <div className="appName">Stock Video Factory</div>
          <div className="appMeta">{dimensions.width}x{dimensions.height} · {props.fps}fps · {props.durationSeconds}s loop</div>
        </div>
        <div className={`status ${status}`}>{message}</div>
      </header>

      <section className="workspace">
        <nav className="rail">
          {(['style', 'scene', 'motion', 'assets', 'render'] as const).map((panel) => (
            <button
              className={activePanel === panel ? 'railButton active' : 'railButton'}
              key={panel}
              onClick={() => setActivePanel(panel)}
            >
              {panel}
            </button>
          ))}
        </nav>

        <aside className="controlPanel">
          {activePanel === 'style' && (
            <div className="panelStack">
              <h2>Visual System</h2>
              <div className="actionRow">
                <button className="primary compact" onClick={randomizeVisual}>Random Visual</button>
                <button className="secondary compact" onClick={randomizeColors}>Random Colors</button>
              </div>
              <div className="presetGrid">
                {factoryPresets.map((preset) => (
                  <button
                    className="presetButton"
                    key={preset.name}
                    onClick={() => setProps((current) => ({...current, ...preset.values}))}
                  >
                    <strong>{preset.name}</strong>
                    <span>{preset.niche}</span>
                  </button>
                ))}
              </div>
              <Field label="Background Layer">
                <select value={props.bgStyle} onChange={(event) => set('bgStyle', event.target.value as StockFactoryProps['bgStyle'])}>
                  {backgroundStyleValues.map((style) => <option key={style}>{style}</option>)}
                </select>
              </Field>
              <Field label="Overlay Layer">
                <select value={props.overlayStyle} onChange={(event) => set('overlayStyle', event.target.value as StockFactoryProps['overlayStyle'])}>
                  {overlayStyleValues.map((style) => <option key={style}>{style}</option>)}
                </select>
              </Field>
              <div className="grid2">
                <Field label="Overlay Color">
                  <select value={props.overlayColorMode} onChange={(event) => set('overlayColorMode', event.target.value as StockFactoryProps['overlayColorMode'])}>
                    {overlayColorModeValues.map((mode) => <option key={mode}>{mode}</option>)}
                  </select>
                </Field>
                <Field label="Symmetry">
                  <select value={props.symmetry} onChange={(event) => set('symmetry', event.target.value as StockFactoryProps['symmetry'])}>
                    {symmetryValues.map((mode) => <option key={mode}>{mode}</option>)}
                  </select>
                </Field>
              </div>
              <div className="colorStrip">
                {props.colors.map((color, index) => (
                  <input
                    aria-label={`Palette ${index + 1}`}
                    key={`${index}-${color}`}
                    type="color"
                    value={color}
                    onChange={(event) => {
                      const next = [...props.colors];
                      next[index] = event.target.value;
                      set('colors', next);
                    }}
                  />
                ))}
              </div>
              <Slider label={`Particles ${props.particleCount}`} min={0} max={240} step={1} value={props.particleCount} onChange={(value) => set('particleCount', value)} />
              <Slider label={`Band Count ${props.bandCount}`} min={2} max={48} step={1} value={props.bandCount} onChange={(value) => set('bandCount', value)} />
              <Slider label={`Chaos / Distortion ${props.distortion.toFixed(2)}`} min={0} max={1} step={0.01} value={props.distortion} onChange={(value) => set('distortion', value)} />
              <Slider label={`Glow Intensity ${props.glowIntensity.toFixed(2)}`} min={0} max={1.5} step={0.01} value={props.glowIntensity} onChange={(value) => set('glowIntensity', value)} />
              <Slider label={`Plexus ${props.plexusDistance.toFixed(2)}`} min={0.05} max={0.6} step={0.01} value={props.plexusDistance} onChange={(value) => set('plexusDistance', value)} />
            </div>
          )}

          {activePanel === 'scene' && (
            <div className="panelStack">
              <h2>Scene</h2>
              <div className="grid2">
                <Field label="Format">
                  <select value={props.format} onChange={(event) => set('format', event.target.value as AspectRatio)}>
                    {formats.map((format) => <option key={format}>{format}</option>)}
                  </select>
                </Field>
                <Field label="Resolution">
                  <select value={props.resolution} onChange={(event) => set('resolution', event.target.value as Resolution)}>
                    {resolutions.map((resolution) => <option key={resolution}>{resolution}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid2">
                <Field label="FPS">
                  <select value={props.fps} onChange={(event) => set('fps', Number(event.target.value) as StockFactoryProps['fps'])}>
                    {fpsValues.map((fps) => <option key={fps}>{fps}</option>)}
                  </select>
                </Field>
                <Field label="Duration">
                  <input type="number" min={3} max={60} value={props.durationSeconds} onChange={(event) => set('durationSeconds', Number(event.target.value))} />
                </Field>
              </div>
              <Field label="Seed">
                <input type="number" value={props.seed} onChange={(event) => set('seed', Number(event.target.value))} />
              </Field>
              <Field label="Color Sync">
                <input type="color" value={props.asset.dominantColor ?? '#ffd84d'} onChange={(event) => set('asset', {...props.asset, dominantColor: event.target.value})} />
              </Field>
              <label className="toggleField">
                <input type="checkbox" checked={props.seamlessLoop} onChange={(event) => set('seamlessLoop', event.target.checked)} />
                <span>Loop playback</span>
              </label>
              <Slider label={`Speed ${props.speed.toFixed(2)}`} min={0} max={3} step={0.01} value={props.speed} onChange={(value) => set('speed', value)} />
              <Slider label={`Gradient Angle ${props.gradientAngle.toFixed(0)}`} min={0} max={360} step={1} value={props.gradientAngle} onChange={(value) => set('gradientAngle', value)} />
              <Slider label={`Zoom ${props.zoom.toFixed(2)}`} min={0.5} max={2.5} step={0.01} value={props.zoom} onChange={(value) => set('zoom', value)} />
            </div>
          )}

          {activePanel === 'motion' && (
            <div className="panelStack">
              <h2>Motion</h2>
              <Field label="Material">
                <select value={props.material} onChange={(event) => set('material', event.target.value as StockFactoryProps['material'])}>
                  {materials.map((material) => <option key={material}>{material}</option>)}
                </select>
              </Field>
              <Field label="Force Field">
                <select value={props.forceField} onChange={(event) => set('forceField', event.target.value as StockFactoryProps['forceField'])}>
                  {forceFields.map((field) => <option key={field}>{field}</option>)}
                </select>
              </Field>
              <Field label="Composition Grid">
                <select value={props.compositionGrid} onChange={(event) => set('compositionGrid', event.target.value as StockFactoryProps['compositionGrid'])}>
                  {grids.map((grid) => <option key={grid}>{grid}</option>)}
                </select>
              </Field>
              <Slider label={`Chaos / Distortion ${props.distortion.toFixed(2)}`} min={0} max={1} step={0.01} value={props.distortion} onChange={(value) => set('distortion', value)} />
              <Slider label={`Complexity ${props.complexity.toFixed(2)}`} min={0} max={1} step={0.01} value={props.complexity} onChange={(value) => set('complexity', value)} />
              <Slider label={`Glow Intensity ${props.glowIntensity.toFixed(2)}`} min={0} max={1.5} step={0.01} value={props.glowIntensity} onChange={(value) => set('glowIntensity', value)} />
              <Slider label={`Color Rotation ${props.colorRotation.toFixed(0)}`} min={-180} max={180} step={1} value={props.colorRotation} onChange={(value) => set('colorRotation', value)} />
              <Slider label={`Grain ${props.grain.toFixed(2)}`} min={0} max={0.35} step={0.01} value={props.grain} onChange={(value) => set('grain', value)} />
              <Slider label={`Motion Blur ${props.motionBlur.toFixed(2)}`} min={0} max={1} step={0.01} value={props.motionBlur} onChange={(value) => set('motionBlur', value)} />
              <Slider label={`Plexus ${props.plexusDistance.toFixed(2)}`} min={0.05} max={0.6} step={0.01} value={props.plexusDistance} onChange={(value) => set('plexusDistance', value)} />
            </div>
          )}

          {activePanel === 'assets' && (
            <div className="panelStack">
              <h2>Assets</h2>
              <div className="actionRow">
                <button className={props.assetEnabled ? 'secondary compact' : 'primary compact'} onClick={() => set('assetEnabled', !props.assetEnabled)}>
                  {props.assetEnabled ? 'Disable Asset' : 'Enable Asset'}
                </button>
                <button className="secondary compact" onClick={() => set('assetEnabled', false)}>Remove From Scene</button>
              </div>
              <label className="dropZone">
                <span>Add SVG/PNG</span>
                <input type="file" accept=".svg,.png,image/svg+xml,image/png" multiple onChange={(event) => uploadAssets(event.target.files)} />
              </label>
              <div className="assetList">
                {assets.map((asset) => (
                  <button
                    className={asset.src === props.asset.src ? 'assetRow active' : 'assetRow'}
                    key={asset.src}
                    onClick={() => setProps((current) => ({...current, asset, assetEnabled: true}))}
                  >
                    <span>{asset.id}</span>
                    <small>{asset.kind.toUpperCase()}</small>
                  </button>
                ))}
              </div>
              <Slider label={`Asset Scale ${props.assetScale.toFixed(2)}`} min={0.2} max={2.4} step={0.01} value={props.assetScale} onChange={(value) => set('assetScale', value)} />
              <Slider label={`Asset Opacity ${props.assetOpacity.toFixed(2)}`} min={0} max={1} step={0.01} value={props.assetOpacity} onChange={(value) => set('assetOpacity', value)} />
              <Slider label={`Asset FX ${props.assetEffectIntensity.toFixed(2)}`} min={0} max={1.5} step={0.01} value={props.assetEffectIntensity} onChange={(value) => set('assetEffectIntensity', value)} />
              <Field label="Asset Material">
                <select value={props.material} onChange={(event) => set('material', event.target.value as StockFactoryProps['material'])}>
                  {materials.map((material) => <option key={material}>{material}</option>)}
                </select>
              </Field>
            </div>
          )}

          {activePanel === 'render' && (
            <div className="panelStack">
              <h2>Render</h2>
              <Field label="Batch Count">
                <input type="number" min={1} max={80} value={batchCount} onChange={(event) => setBatchCount(Number(event.target.value))} />
              </Field>
              <button className="primary" disabled={status === 'rendering'} onClick={() => render(1)}>Render Single</button>
              <button className="secondary" disabled={status === 'rendering'} onClick={() => render(batchCount)}>Render Batch</button>
              <div className="outputs">
                {outputs.map((output) => <div key={output}>{output}</div>)}
              </div>
            </div>
          )}
        </aside>

        <section className="preview">
          <div className={`playerFrame ${previewScale}`}>
            <Player
              component={PreviewComposition}
              inputProps={props}
              durationInFrames={durationInFrames}
              fps={props.fps}
              compositionWidth={dimensions.width}
              compositionHeight={dimensions.height}
              controls
              autoPlay
              acknowledgeRemotionLicense
              loop={props.seamlessLoop}
              style={{width: '100%', height: '100%'}}
            />
          </div>
        </section>
      </section>
    </main>
  );
}

const Field = ({label, children}: {label: string; children: React.ReactNode}) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);

const Slider = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) => (
  <label className="field">
    <span>{label}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>
);
