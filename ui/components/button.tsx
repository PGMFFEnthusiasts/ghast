import type { ParentProps } from 'solid-js';

export const Button = (props: ParentProps & { onClick: () => void }) => (
  <button
    class='size-8 rounded p-2 outline-1 outline-gray-200 transition-all hover:cursor-pointer hover:outline-gray-400 active:scale-95 active:bg-gray-200'
    onclick={() => props.onClick()}
  >
    {props.children}
  </button>
);
