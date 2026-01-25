import type { JSX } from 'solid-js';

import { clsx } from 'clsx';

import { Header } from '@/components/layouts/header';

type LayoutProps = {
  children?: JSX.Element | JSX.Element[];
  description: JSX.Element;
  fillViewport?: boolean;
  title: JSX.Element;
};

const Layout = (props: LayoutProps) => (
  <div
    class={clsx(
      `overflow-x-clip`,
      props.fillViewport && `h-screen overflow-hidden`,
    )}
  >
    <div
      class={clsx(
        `container mx-auto flex flex-col space-y-4 p-4 xl:p-8`,
        props.fillViewport ? `h-full` : `min-h-screen pb-16 xl:pb-24`,
      )}
    >
      <Header description={props.description} title={props.title} />
      {props.children}
    </div>
  </div>
);

export { Layout };
