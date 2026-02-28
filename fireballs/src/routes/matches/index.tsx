import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => <div>Hello /matches/!</div>;
export const Route = createFileRoute(`/matches/`)({
  component: RouteComponent,
});
