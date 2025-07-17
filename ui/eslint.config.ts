import {
  eslintConfigBase,
  eslintConfigPefectionist,
  eslintConfigPrettier,
  eslintConfigRelative,
  eslintConfigTypescript,
} from '@hiddenability/opinionated-defaults/eslint';

export default [
  ...eslintConfigBase,
  ...eslintConfigTypescript,
  ...eslintConfigRelative,
  ...eslintConfigPrettier,
  ...eslintConfigPefectionist,
  {
    rules: {
      'no-console': [`warn`],
      quotes: [`warn`, `backtick`, { avoidEscape: true }],
    },
  },
];
