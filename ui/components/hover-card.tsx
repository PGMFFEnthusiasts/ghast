import type { JSX } from 'solid-js';

import { createSignal, onCleanup, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

const MIN_WIDTH = 768;

export const HoverCard = (props: {
  children: JSX.Element;
  class?: string;
  content: JSX.Element;
  glowColor?: string;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [isWideEnough, setIsWideEnough] = createSignal(false);

  const handleResize = () => {
    setIsWideEnough(globalThis.innerWidth >= MIN_WIDTH);
  };

  onMount(() => {
    handleResize();
    globalThis.addEventListener(`resize`, handleResize);
  });

  const handleMouseMove = (e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (e.pointerType === `touch`) return;
    setPosition({ x: e.clientX, y: e.clientY });
    setIsHovered(true);
    globalThis.addEventListener(`mousemove`, handleMouseMove);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    globalThis.removeEventListener(`mousemove`, handleMouseMove);
  };

  onCleanup(() => {
    globalThis.removeEventListener(`mousemove`, handleMouseMove);
    globalThis.removeEventListener(`resize`, handleResize);
  });

  const cardStyle = () => ({
    left: `${position().x + 16}px`,
    top: `${position().y + 16}px`,
  });

  return (
    <div
      class={props.class}
      onClick={() => props.onClick?.()}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {props.children}
      <Show when={isHovered() && isWideEnough()}>
        <Portal>
          <div
            class='pointer-events-none fixed z-9999 overflow-hidden rounded-lg border border-white/10 bg-[#1a1f2e]/95 p-3 shadow-xl backdrop-blur-md'
            style={cardStyle()}
          >
            <span
              class='pointer-events-none absolute -inset-x-64 top-0 h-256 -translate-y-1/2 bg-radial from-current/10 to-transparent to-80%'
              style={{ color: props.glowColor ?? `#ffffff` }}
            />
            {props.content}
          </div>
        </Portal>
      </Show>
    </div>
  );
};
