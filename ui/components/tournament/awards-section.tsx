import type { JSX } from 'solid-js';

import { clsx } from 'clsx';

export const AwardsSection = (props: {
  children: JSX.Element;
  class?: string;
}) => (
  <div
    class={clsx(
      `relative left-1/2 -ml-[50vw] w-screen overflow-x-clip`,
      props.class,
    )}
  >
    <div class='container mx-auto px-4 xl:px-8'>{props.children}</div>
  </div>
);
