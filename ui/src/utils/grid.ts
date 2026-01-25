import { themeQuartz } from 'ag-grid-community';

let _gridTheme: ReturnType<typeof themeQuartz.withParams> | undefined;

export const getGridTheme = () => {
  _gridTheme ??= themeQuartz.withParams({
    cellFontFamily: globalThis
      .getComputedStyle(document.body)
      .getPropertyValue(`--font-mono`),
    fontFamily: globalThis
      .getComputedStyle(document.body)
      .getPropertyValue(`--font-sans`),
  });
  return _gridTheme;
};
