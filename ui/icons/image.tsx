import type { JSX } from 'solid-js';

// Icon from Heroicons - https://heroicons.com/
export const Image = (props: JSX.IntrinsicElements[`svg`]) => (
  <svg
    fill='none'
    height='1em'
    stroke='currentColor'
    stroke-width='2'
    viewBox='0 0 24 24'
    width='1em'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);
