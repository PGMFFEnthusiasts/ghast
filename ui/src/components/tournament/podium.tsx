/* SLOP ALERT */

import { clsx } from 'clsx';
import { For } from 'solid-js';

import { BG_COLOR } from '@/components/tournament/noise-background';

export const Podium = (props: {
  color: string;
  depth?: number;
  id: string;
  offsetY?: string;
}) => {
  const depth = () => props.depth ?? 150;
  const width = 380;
  const cx = width / 2;
  const radiusX = 170;
  const radiusY = 62;
  const numSides = 8;
  const visibleSides = [2, 3, 4, 5];
  const visibleLines = [2, 3, 4, 5, 6];

  const topPoints = Array.from({ length: numSides }, (_, i) => {
    const angle = (Math.PI * 2 * i) / numSides - Math.PI / 2;
    return {
      x: cx + radiusX * Math.cos(angle),
      y: radiusY + radiusY * Math.sin(angle),
    };
  });

  const bottomPoints = () =>
    topPoints.map((p) => ({ x: p.x, y: p.y + depth() }));
  const topPath =
    topPoints.map((p, i) => `${i === 0 ? `M` : `L`}${p.x},${p.y}`).join(` `) +
    ` Z`;

  const sidePath = (i: number) => {
    const next = (i + 1) % numSides;
    return `M${topPoints[i].x},${topPoints[i].y} L${topPoints[next].x},${topPoints[next].y} L${bottomPoints()[next].x},${bottomPoints()[next].y} L${bottomPoints()[i].x},${bottomPoints()[i].y} Z`;
  };

  return (
    <svg
      class={clsx(
        `pointer-events-none absolute top-full left-1/2 -z-10 -translate-x-1/2`,
        props.offsetY ?? `-translate-y-20`,
      )}
      height={depth() + 80}
      style={{ overflow: `visible` }}
      viewBox={`0 0 ${width} ${depth() + 80}`}
      width={width}
    >
      <defs>
        <For each={visibleSides}>
          {(i) => {
            const next = (i + 1) % numSides;
            return (
              <linearGradient
                gradientUnits='userSpaceOnUse'
                id={`side-glow-${props.id}-${i}`}
                x1='0'
                x2='0'
                y1={Math.min(topPoints[i].y, topPoints[next].y)}
                y2={Math.max(bottomPoints()[i].y, bottomPoints()[next].y)}
              >
                <stop
                  offset='0%'
                  stop-color={props.color}
                  stop-opacity='0.35'
                />
                <stop
                  offset='20%'
                  stop-color={props.color}
                  stop-opacity='0.2'
                />
                <stop
                  offset='40%'
                  stop-color={props.color}
                  stop-opacity='0.08'
                />
                <stop
                  offset='60%'
                  stop-color={props.color}
                  stop-opacity='0.02'
                />
                <stop offset='75%' stop-color={props.color} stop-opacity='0' />
              </linearGradient>
            );
          }}
        </For>
        <For each={visibleLines}>
          {(i) => (
            <linearGradient
              gradientUnits='userSpaceOnUse'
              id={`line-fade-${props.id}-${i}`}
              x1='0'
              x2='0'
              y1={topPoints[i].y}
              y2={bottomPoints()[i].y}
            >
              <stop offset='0%' stop-color={props.color} stop-opacity='0.6' />
              <stop offset='30%' stop-color={props.color} stop-opacity='0.3' />
              <stop offset='55%' stop-color={props.color} stop-opacity='0.08' />
              <stop offset='75%' stop-color={props.color} stop-opacity='0' />
            </linearGradient>
          )}
        </For>
        <radialGradient id={`bg-mask-grad-${props.id}`}>
          <stop offset='0%' stop-color='white' />
          <stop offset='80%' stop-color='white' />
          <stop offset='100%' stop-color='black' />
        </radialGradient>
        <mask id={`podium-mask-${props.id}`}>
          <ellipse
            cx={cx}
            cy={radiusY}
            fill={`url(#bg-mask-grad-${props.id})`}
            rx={radiusX * 1.8}
            ry={depth() * 1.15}
          />
        </mask>
      </defs>
      <g>
        <path d={topPath} fill={BG_COLOR} />
        <path d={topPath} fill={props.color} fill-opacity='0.4' />
        <path
          d={topPath}
          fill='transparent'
          stroke={props.color}
          stroke-linejoin='bevel'
          stroke-width='1.5'
        />
        <g mask={`url(#podium-mask-${props.id})`}>
          <For each={visibleSides}>
            {(i) => <path d={sidePath(i)} fill={BG_COLOR} />}
          </For>
        </g>
        <For each={visibleSides}>
          {(i) => (
            <path d={sidePath(i)} fill={`url(#side-glow-${props.id}-${i})`} />
          )}
        </For>
        <For each={visibleLines}>
          {(i) => (
            <line
              stroke={`url(#line-fade-${props.id}-${i})`}
              stroke-width='1.5'
              x1={topPoints[i].x}
              x2={bottomPoints()[i].x}
              y1={topPoints[i].y}
              y2={bottomPoints()[i].y}
            />
          )}
        </For>
      </g>
    </svg>
  );
};
