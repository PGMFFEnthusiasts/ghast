import { createSignal } from 'solid-js';

export const useTheme = () => {
  const [getTheme, setTheme] = createSignal<`dark` | `light`>(
    globalThis.matchMedia(`(prefers-color-scheme: dark)`).matches ?
      `dark`
    : `light`,
  );

  globalThis
    .matchMedia(`(prefers-color-scheme: dark)`)
    .addEventListener(`change`, ({ matches }) => {
      setTheme(matches ? `dark` : `light`);
    });

  return getTheme;
};
