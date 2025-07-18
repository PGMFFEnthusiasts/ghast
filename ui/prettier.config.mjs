import {
  merge,
  prettierConfigBase,
  prettierConfigTailwind,
} from '@hiddenability/opinionated-defaults/prettier';

export default merge(prettierConfigBase, prettierConfigTailwind, {
  tailwindStylesheet: `./styles/main.css`,
});
