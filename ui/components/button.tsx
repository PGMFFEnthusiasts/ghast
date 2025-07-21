import type { ParentProps } from 'solid-js';

import { cn } from '@/utils/cn';

export const Button = (
  props: ParentProps & { class?: string; onClick: () => void },
) => (
  <button
    class={cn(
      `flex size-8 items-center justify-center rounded p-2 transition-all hover:cursor-pointer active:scale-95`,
      `outline-1 outline-border hover:outline-border-hover active:outline-border-active`,
      `hover:bg-background-hover active:bg-background-active`,
      props.class,
    )}
    onclick={() => props.onClick()}
  >
    {props.children}
  </button>
);
