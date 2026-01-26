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
      props.exportBlur ? `bg-[#0B101A]/90` : `bg-[#0B101A]/85 backdrop-blur-sm`,
      props.class ?? `bottom-16`,
    )}
  >
    <span
      class='pointer-events-none absolute -inset-x-2 bottom-0 h-48 translate-y-1/2 bg-radial from-current/15 to-transparent to-90%'
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
