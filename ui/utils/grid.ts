import { themeQuartz } from 'ag-grid-community';

export const gridTheme = themeQuartz.withParams({
  cellFontFamily: globalThis
    .getComputedStyle(document.body)
    .getPropertyValue(`--font-mono`),
  fontFamily: globalThis
    .getComputedStyle(document.body)
    .getPropertyValue(`--font-sans`),
});
