import { includeIgnoreFile } from '@eslint/compat';
import {
  eslintConfig,
  eslintConfigBase,
  eslintConfigPerfectionist,
  eslintConfigPrettier,
  eslintConfigRelative,
  eslintConfigSolid,
} from '@hiddenability/opinionated-defaults/eslint';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import { fileURLToPath } from 'node:url';

export default eslintConfig([
  includeIgnoreFile(fileURLToPath(new URL(`.gitignore`, import.meta.url)), ``),
  includeIgnoreFile(
    fileURLToPath(new URL(`../.gitignore`, import.meta.url)),
    ``,
  ),
  ...eslintConfigBase,
  ...eslintConfigPerfectionist,
  ...eslintConfigPrettier,
  ...eslintConfigRelative,
  ...eslintConfigSolid,
  {
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    rules: {
      'better-tailwindcss/enforce-canonical-classes': `warn`,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: `styles/main.css`,
      },
    },
  },
]);
