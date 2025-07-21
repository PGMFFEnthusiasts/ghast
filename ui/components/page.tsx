import type { ParentProps } from 'solid-js';

import { Header } from '@/components/branding';

export const ProsefulPage = (props: ParentProps) => (
  <main class='mx-auto h-fit max-w-xl space-y-6 py-8 max-sm:p-4'>
    <Header />
    {props.children}
  </main>
);
