import type { ParentProps } from 'solid-js';

import { clsx } from 'clsx';

export const Button = (props: ParentProps & { onClick: () => void }) => (
  <button
    class={clsx(
      `flex size-8 items-center justify-center rounded p-2 transition-all hover:cursor-pointer active:scale-95`,
      `outline-border hover:outline-border-hover active:outline-border-active outline-1`,
      `active:bg-background-active hover:bg-background-hover`,
    )}
    onclick={() => props.onClick()}
  >
    {props.children}
  </button>
);
