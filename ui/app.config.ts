import { defineConfig } from '@solidjs/start/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    preset: `static`,
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/': `${process.cwd()}/src/`,
      },
    },
  },
});
