import type { JSX } from 'solid-js';

import { createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

export const HoverCard = (props: {
  children: JSX.Element;
  class?: string;
  content: JSX.Element;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseEnter = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setIsHovered(true);
    globalThis.addEventListener(`mousemove`, handleMouseMove);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    globalThis.removeEventListener(`mousemove`, handleMouseMove);
  };

  onCleanup(() => {
    globalThis.removeEventListener(`mousemove`, handleMouseMove);
  });

  return (
    <div
      class={props.class}
      onClick={() => props.onClick?.()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.children}
      <Portal>
        <Show when={isHovered()}>
          <div
            class='pointer-events-none fixed z-[9999] rounded-lg border border-white/10 bg-[#1a1f2e] p-3 shadow-xl'
            style={{
              left: `${position().x + 16}px`,
              top: `${position().y + 16}px`,
            }}
          >
            {props.content}
          </div>
        </Show>
      </Portal>
    </div>
  );
};
