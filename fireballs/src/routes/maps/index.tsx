import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => <div>Hello "/maps/"!</div>;
export const Route = createFileRoute(`/maps/`)({
  component: RouteComponent,
});
