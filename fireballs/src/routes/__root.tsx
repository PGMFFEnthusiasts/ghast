import type { QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  createRootRouteWithContext,
  HeadContent,
  Link,
  Outlet,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { Footer } from '@/src/components/footer';
import Header from '@/src/components/header';
import TanStackQueryDevtools from '@/src/integrations/tanstack-query/devtools';
import TanStackQueryProvider from '@/src/integrations/tanstack-query/root-provider';
import appCss from '@/src/styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

const RootDocument = ({ children }: { children: ReactNode }) => (
  <html lang='en'>
    <head>
      <HeadContent />
    </head>
    <body>
      <TanStackQueryProvider>
        <div className='flex min-h-screen grow flex-col'>
          <Header />
          {children}
        </div>
        <Footer />
        <TanStackDevtools
          config={{
            position: `bottom-right`,
          }}
          plugins={[
            {
              name: `Tanstack Router`,
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      </TanStackQueryProvider>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: Outlet,
  head: () => ({
    links: [
      {
        href: appCss,
        rel: `stylesheet`,
      },
    ],
    meta: [
      {
        charSet: `utf-8`,
      },
      {
        content: `width=device-width, initial-scale=1`,
        name: `viewport`,
      },
      {
        title: `Fireballs`,
      },
    ],
  }),
  notFoundComponent: () => (
    <div className='container mx-auto flex flex-col items-center justify-center gap-4 px-6 py-32'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-secondary-foreground/70'>Page not found.</p>
      <Link className='text-primary underline' to='/'>
        Go home
      </Link>
    </div>
  ),
  shellComponent: RootDocument,
});
