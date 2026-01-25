import type { JSX } from 'solid-js';

// Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE
export const ArrowUp = (props: JSX.IntrinsicElements[`svg`]) => (
  <svg
    height='1em'
    viewBox='0 0 24 24'
    width='1em'
    xmlns='http://www.w3.org/2000/svg'
    {...props}
  >
    <path
      d='M12 5v14m6-8l-6-6m-6 6l6-6'
      fill='none'
      stroke='currentColor'
      stroke-linecap='round'
      stroke-linejoin='round'
      stroke-width='2'
    />
  </svg>
);
