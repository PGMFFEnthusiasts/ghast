import type { JSX } from 'solid-js';

export const ChevronLeft = (props: JSX.IntrinsicElements[`svg`]) => (
  <svg
    fill='none'
    height='1em'
    stroke='currentColor'
    stroke-linecap='round'
    stroke-linejoin='round'
    stroke-width={2}
    viewBox='0 0 24 24'
    width='1em'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='m15 6-6 6 6 6' />
  </svg>
);
