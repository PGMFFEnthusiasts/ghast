import { includeIgnoreFile } from '@eslint/compat';
import {
  eslintConfig,
  eslintConfigBase,
  eslintConfigPerfectionist,
  eslintConfigPrettier,
  eslintConfigRelative,
  eslintConfigSolid,
} from '@hiddenability/opinionated-defaults/eslint';
import { fileURLToPath } from 'node:url';

const gitignorePath = fileURLToPath(new URL(`.gitignore`, import.meta.url));

export default eslintConfig([
  includeIgnoreFile(gitignorePath, `Imported .gitignore patterns`),
  ...eslintConfigBase,
  ...eslintConfigPerfectionist,
  ...eslintConfigPrettier,
  ...eslintConfigSolid,
  ...eslintConfigRelative,
  {
    rules: {
      '@typescript-eslint/no-unsafe-argument': `warn`,
    },
  },
]);
