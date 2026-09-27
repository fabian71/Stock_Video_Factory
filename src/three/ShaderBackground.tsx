import {Canvas, useFrame} from '@react-three/fiber';
import {useMemo, useRef} from 'react';
import * as THREE from 'three';
import type {FactoryPalette} from '../palette/palette';
import {colorToVector} from '../palette/palette';
import type {BodyState} from '../types';

type ShaderBackgroundProps = {
  palette: FactoryPalette;
  asset: BodyState;
  progress: number;
};

const fragmentShader = `
uniform float uTime;
uniform vec2 uAsset;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uAccent;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv * 2.0 - 1.0;
  vec2 asset = uAsset;
  float distanceToAsset = length(centered - asset);
  float ripple = sin(distanceToAsset * 18.0 - uTime * 6.283185) * 0.5 + 0.5;
  float flow = noise(uv * 4.0 + vec2(uTime * 0.45, -uTime * 0.25));
  float vignette = smoothstep(1.15, 0.2, length(centered));
  vec3 base = mix(uColorA, uColorB, uv.y + flow * 0.18);
  vec3 reactive = mix(base, uAccent, ripple * smoothstep(0.55, 0.0, distanceToAsset));
  gl_FragColor = vec4(reactive * (0.68 + vignette * 0.48), 1.0);
}
`;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const ReactivePlane = ({palette, asset, progress}: ShaderBackgroundProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: {value: progress},
      uAsset: {value: new THREE.Vector2(asset.x, -asset.y)},
      uColorA: {value: new THREE.Vector3(...colorToVector(palette.backgroundA))},
      uColorB: {value: new THREE.Vector3(...colorToVector(palette.backgroundB))},
      uAccent: {value: new THREE.Vector3(...colorToVector(palette.accent))},
    }),
    [asset.x, asset.y, palette.accent, palette.backgroundA, palette.backgroundB, progress],
  );

  useFrame(() => {
    if (!materialRef.current) {
      return;
    }
    materialRef.current.uniforms.uTime.value = progress;
    materialRef.current.uniforms.uAsset.value.set(asset.x, -asset.y);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={materialRef} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
};

export const ShaderBackground = (props: ShaderBackgroundProps) => (
  <Canvas
    orthographic
    camera={{position: [0, 0, 1], zoom: 1}}
    gl={{antialias: true, alpha: false, preserveDrawingBuffer: true}}
    style={{position: 'absolute', inset: 0}}
  >
    <ReactivePlane {...props} />
  </Canvas>
);
