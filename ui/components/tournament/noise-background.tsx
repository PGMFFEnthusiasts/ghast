/* SLOP ALERT */
import { clsx } from 'clsx';
import { createSignal, onMount, Show } from 'solid-js';

import { INDEX_COLORS } from '@/components/tournament/tournament-utils';

export const BG_COLOR = `#0B101A`;
export const GOLD = INDEX_COLORS.mvp;
export const BLUE = `#60A5FA`;

const hexToRgb = (hex: string) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const [r, g, b] = match?.slice(1).map((h) => Number.parseInt(h, 16)) ?? [
    255, 221, 0,
  ];
  return { b, g, r };
};

const mulberry32 = (a: number) => () => {
  let t = (a += 0x6d_2b_79_f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (t: number, a: number, b: number) => a + t * (b - a);

const grad2d = (hash: number, x: number, y: number) => {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
};

const generatePermutation = (seed: number) => {
  const random = mulberry32(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
};

const perlin2D = (x: number, y: number, perm: number[]) => {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);

  const aa = perm[perm[X] + Y];
  const ab = perm[perm[X] + Y + 1];
  const ba = perm[perm[X + 1] + Y];
  const bb = perm[perm[X + 1] + Y + 1];

  return lerp(
    v,
    lerp(u, grad2d(aa, xf, yf), grad2d(ba, xf - 1, yf)),
    lerp(u, grad2d(ab, xf, yf - 1), grad2d(bb, xf - 1, yf - 1)),
  );
};

const turbulence = (
  x: number,
  y: number,
  octaves: number,
  baseFreq: number,
  perm: number[],
) =>
  Array.from({ length: octaves }).reduce<{
    amplitude: number;
    frequency: number;
    value: number;
  }>(
    (acc) => ({
      amplitude: acc.amplitude * 0.5,
      frequency: acc.frequency * 2,
      value:
        acc.value +
        acc.amplitude *
          Math.abs(perlin2D(x * acc.frequency, y * acc.frequency, perm)),
    }),
    { amplitude: 1, frequency: baseFreq, value: 0 },
  ).value;

const generateNoiseTexture = (
  width: number,
  height: number,
  color: string,
  seed: number,
): string => {
  const canvas = document.createElement(`canvas`);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext(`2d`);
  if (!ctx) return ``;

  const rgb = hexToRgb(color);
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const baseFrequency = 0.06;
  const octaves = 4;

  const surfaceScale = 25;
  const specularConstant = 0.75;
  const specularExponent = 20;

  const azimuthRad = (3 * Math.PI) / 180;
  const elevationRad = (100 * Math.PI) / 180;
  const Lx = Math.cos(elevationRad) * Math.cos(azimuthRad);
  const Ly = Math.cos(elevationRad) * Math.sin(azimuthRad);
  const Lz = Math.sin(elevationRad);

  const Hx = Lx;
  const Hy = Ly;
  const Hz = Lz + 1;
  const Hlen = Math.hypot(Hx, Hy, Hz);
  const Hnx = Hx / Hlen;
  const Hny = Hy / Hlen;
  const Hnz = Hz / Hlen;

  const perm = generatePermutation(seed);

  const heightMap = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      heightMap[y * width + x] =
        turbulence(x, y, octaves, baseFrequency, perm) * surfaceScale;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;

      const h = heightMap[y * width + x];
      const hRight = heightMap[y * width + ((x + 1) % width)];
      const hDown = heightMap[((y + 1) % height) * width + x];

      const dx = h - hRight;
      const dy = h - hDown;
      const nLen = Math.sqrt(dx * dx + dy * dy + 1);
      const Nx = dx / nLen;
      const Ny = dy / nLen;
      const Nz = 1 / nLen;

      const NdotH = Math.max(0, Nx * Hnx + Ny * Hny + Nz * Hnz);
      const specular = specularConstant * Math.pow(NdotH, specularExponent);

      const intensity = Math.min(255, specular * 800);

      data[i] = (rgb.r * intensity) / 255;
      data[i + 1] = (rgb.g * intensity) / 255;
      data[i + 2] = (rgb.b * intensity) / 255;
      data[i + 3] = intensity > 5 ? Math.min(255, intensity * 1.5) : 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL(`image/png`);
};

const ExportNoiseTexture = (props: {
  color: string;
  height: number;
  maskRy?: string;
  noiseOpacity?: string;
  seed: number;
  svgClass?: string;
  width: number;
}) => {
  const [textureUrl, setTextureUrl] = createSignal<string>();

  onMount(() => {
    const url = generateNoiseTexture(
      props.width,
      props.height,
      props.color,
      props.seed,
    );
    setTextureUrl(url);
  });

  return (
    <Show when={textureUrl()}>
      <div
        class={clsx(
          `pointer-events-none absolute -z-20`,
          props.noiseOpacity ?? `opacity-30`,
          props.svgClass ?? `inset-0 size-full`,
        )}
        style={{
          '-webkit-mask-image': `radial-gradient(ellipse 50% ${props.maskRy ?? `50%`} at 50% 50%, white 60%, transparent 100%)`,
          'background-image': `url("${textureUrl()}")`,
          'background-repeat': `repeat`,
          'background-size': `100px 100px`,
          'image-rendering': `pixelated`,
          'mask-image': `radial-gradient(ellipse 50% ${props.maskRy ?? `50%`} at 50% 50%, white 60%, transparent 100%)`,
        }}
      />
    </Show>
  );
};

export const NoiseBackground = (props: {
  color: string;
  exportMode?: boolean;
  glowClass: string;
  id: string;
  maskRy?: string;
  noiseOpacity?: string;
  seed: number;
  svgClass?: string;
}) => (
  <>
    <span
      class={clsx(
        `pointer-events-none absolute -z-10 blur-3xl`,
        props.glowClass,
      )}
    />
    {props.exportMode ?
      <ExportNoiseTexture
        color={props.color}
        height={200}
        maskRy={props.maskRy}
        noiseOpacity={props.noiseOpacity}
        seed={props.seed}
        svgClass={props.svgClass}
        width={200}
      />
    : <svg
        class={clsx(
          `pointer-events-none absolute -z-20`,
          props.noiseOpacity ?? `opacity-20`,
          props.svgClass ?? `inset-0 size-full`,
        )}
      >
        <defs>
          <filter
            filterUnits='objectBoundingBox'
            height='140%'
            id={props.id}
            primitiveUnits='userSpaceOnUse'
            width='140%'
            x='-20%'
            y='-20%'
          >
            <feTurbulence
              baseFrequency='0.102'
              height='100%'
              numOctaves='4'
              result='turbulence'
              seed={props.seed}
              stitchTiles='stitch'
              type='turbulence'
              width='100%'
              x='0%'
              y='0%'
            />
            <feSpecularLighting
              height='100%'
              in='turbulence'
              lighting-color={props.color}
              result='specularLighting'
              specularConstant='0.75'
              specularExponent='20'
              surfaceScale='15'
              width='100%'
              x='0%'
              y='0%'
            >
              <feDistantLight azimuth='3' elevation='100' />
            </feSpecularLighting>
          </filter>
          <radialGradient id={`${props.id}-fade`}>
            <stop offset='0%' stop-color='white' />
            <stop offset={props.maskRy ? `70%` : `50%`} stop-color='white' />
            <stop offset='100%' stop-color='black' />
          </radialGradient>
          <mask id={`${props.id}-mask`}>
            <ellipse
              cx='50%'
              cy='50%'
              fill={`url(#${props.id}-fade)`}
              rx='50%'
              ry={props.maskRy ?? `50%`}
            />
          </mask>
        </defs>
        <rect
          fill={props.color}
          filter={`url(#${props.id})`}
          height='100%'
          mask={`url(#${props.id}-mask)`}
          width='100%'
        />
      </svg>
    }
  </>
);

export const GoldBackground = (props: {
  exportMode?: boolean;
  noiseOpacity?: string;
}) => (
  <NoiseBackground
    color={GOLD}
    exportMode={props.exportMode}
    glowClass='inset-x-0 -top-20 -bottom-10 bg-radial from-[#FFDD00]/20 via-[#FFDD00]/5 via-40% to-transparent'
    id={props.exportMode ? `noise-export` : `noise`}
    noiseOpacity={props.noiseOpacity}
    seed={15}
  />
);

export const BlueBackground = (props: {
  exportMode?: boolean;
  noiseOpacity?: string;
}) => (
  <NoiseBackground
    color={BLUE}
    exportMode={props.exportMode}
    glowClass='inset-x-0 -top-80 -bottom-96 bg-radial from-[#60A5FA]/20 from-40% via-[#60A5FA]/15 via-65% to-transparent to-90%'
    id={props.exportMode ? `blue-noise-export` : `blue-noise`}
    maskRy='45%'
    noiseOpacity={props.noiseOpacity ?? `opacity-35`}
    seed={42}
    svgClass='-inset-x-40 -top-60 -bottom-[300px] h-[calc(100%+600px)] w-[calc(100%+320px)]'
  />
);
