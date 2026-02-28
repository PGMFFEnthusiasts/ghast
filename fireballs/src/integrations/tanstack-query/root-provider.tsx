import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let context:
  | undefined
  | {
      queryClient: QueryClient;
    };

export const getContext = () => {
  if (context) {
    return context;
  }

  const queryClient = new QueryClient();

  context = {
    queryClient,
  };

  return context;
};

export default function TanStackQueryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { queryClient } = getContext();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
