import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => (
  <section>
    <div className='container mx-auto'>Rules</div>
  </section>
);

export const Route = createFileRoute(`/rules`)({
  component: RouteComponent,
});
