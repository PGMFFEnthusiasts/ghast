import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  const { 'player-id': playerId } = Route.useParams();
  return <div>PlayerID: {playerId}</div>;
};

export const Route = createFileRoute(`/players/$player-id`)({
  component: RouteComponent,
});
