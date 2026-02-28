import { includeIgnoreFile } from '@eslint/compat';
import {
  eslintConfig,
  eslintConfigBase,
  eslintConfigDefaultProject,
  eslintConfigPerfectionist,
  eslintConfigPrettier,
  eslintConfigReact,
  eslintConfigRelative,
} from '@hiddenability/opinionated-defaults/eslint';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { fileURLToPath } from 'node:url';

export default eslintConfig([
  includeIgnoreFile(fileURLToPath(new URL(`.gitignore`, import.meta.url)), ``),
  { ignores: [`src/routeTree.gen.ts`] },
  ...eslintConfigBase,
  ...eslintConfigDefaultProject([`prettier.config.mjs`]),
  ...eslintConfigPerfectionist,
  ...eslintConfigPrettier,
  ...eslintConfigReact,
  ...eslintConfigRelative,
  {
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      'better-tailwindcss/enforce-canonical-classes': `warn`,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: `./src/styles/styles.css`,
      },
    },
  },
]);
