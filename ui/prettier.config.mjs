import {
  merge,
  prettierConfigBase,
  prettierConfigTailwind,
} from '@hiddenability/opinionated-defaults/prettier';

export default merge(prettierConfigBase, prettierConfigTailwind);
