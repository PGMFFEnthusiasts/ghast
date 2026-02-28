import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => <div>Hello "/maps/$map"!</div>;
export const Route = createFileRoute(`/maps/$map`)({
  component: RouteComponent,
});
