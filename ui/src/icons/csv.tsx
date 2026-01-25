import type { JSX } from 'solid-js';

// Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE
export const Csv = (props: JSX.IntrinsicElements[`svg`]) => (
  <svg
    height='1em'
    viewBox='0 0 24 24'
    width='1em'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M10 15a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1m3-1l2 8l2-8M7 10a2 2 0 1 0-4 0v4a2 2 0 1 0 4 0'
      fill='none'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
      stroke-width='2'
    />
  </svg>
);
