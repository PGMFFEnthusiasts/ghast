import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

import { getContext } from '@/src/integrations/tanstack-query/root-provider';
import { routeTree } from '@/src/routeTree.gen';

export const getRouter = () => {
  const { queryClient } = getContext();

  const router = createTanStackRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: `intent`,
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });

  setupRouterSsrQueryIntegration({ queryClient, router });

  return router;
};

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
