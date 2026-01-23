import type { JSX } from 'solid-js';

import { A, useLocation } from '@solidjs/router';

type HeaderProps = {
  description: JSX.Element;
  title: JSX.Element;
};

const getParentPath = (pathname: string): string => {
  const segments = pathname.split(`/`).filter(Boolean);
  return segments.length <= 1 ? `/` : `/` + segments.slice(0, -1).join(`/`);
};

const Header = (props: HeaderProps) => {
  const location = useLocation();
  const parentPath = () => getParentPath(location.pathname);
  const isRootParent = () => parentPath() === `/`;

  return (
    <header class='flex flex-col'>
      {isRootParent() ?
        <A
          class='group text-primary/60 transition-colors duration-200 hover:text-primary'
          href='/'
        >
          ← The{` `}
          <span class='rounded bg-red-500/35 px-2 py-1 font-black transition-colors duration-200 group-hover:bg-red-500/50'>
            OFFICIAL
          </span>
          {` `}
          TB "Work In Progress" Homepage
        </A>
      : <A
          class='text-primary/60 transition-colors duration-200 hover:text-primary'
          href={parentPath()}
        >
          ← Back
        </A>
      }
      <div class='mt-2 text-2xl font-bold'>{props.title}</div>
      <div class='text-secondary'>{props.description}</div>
    </header>
  );
};

export { Header };
