import { clsx } from 'clsx';
import { Show } from 'solid-js';

export const PlayerLabel = (props: {
  class?: string;
  exportBlur?: boolean;
  glowColor?: string;
  label?: string;
  username: string;
}) => (
  <div
    class={clsx(
      `absolute left-1/2 flex -translate-x-1/2 flex-col items-center overflow-hidden rounded-lg border border-white/10 px-4 py-2`,
      props.exportBlur ? `bg-[#0B101A]/90` : `bg-[#0B101A]/70 backdrop-blur-md`,
      props.class ?? `bottom-16`,
    )}
  >
    <span
      class='pointer-events-none absolute inset-x-0 -bottom-8 h-20 bg-radial from-current/50 to-transparent to-60% opacity-25'
      style={{ color: props.glowColor ?? `#ffffff` }}
    />
    <span class='font-maple-mono text-lg font-semibold whitespace-nowrap'>
      {props.username}
    </span>
    <div class='h-1 border-t border-white' />
    <Show when={props.label}>
      <span class='text-center font-rubik text-sm whitespace-nowrap text-secondary/80'>
        {props.label}
      </span>
    </Show>
  </div>
);
