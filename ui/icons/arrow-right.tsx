import type { JSX } from 'solid-js';

export const ArrowRight = (props: JSX.IntrinsicElements[`svg`]) => (
  <svg
    fill='none'
    height='1em'
    stroke='currentColor'
    stroke-linecap='round'
    stroke-linejoin='round'
    stroke-width={2.5}
    viewBox='0 0 24 24'
    width='1em'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path d='M13.5 19.5 21 12m0 0-7.5-7.5M21 12H5' />
  </svg>
);
