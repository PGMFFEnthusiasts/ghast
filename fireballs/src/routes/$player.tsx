import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

import { PlayerFace } from '@/src/components/player-face';

type PlayerAggregateStats = {
  assists: number;
  catches: number;
  damage_carrier: number;
  damage_dealt: number;
  damage_taken: number;
  deaths: number;
  defensive_interceptions: number;
  kills: number;
  killstreak: number;
  pass_interceptions: number;
  passes: number;
  passing_blocks: number;
  pickups: number;
  receive_blocks: number;
  strips: number;
  throws: number;
  touchdown_passes: number;
  touchdowns: number;
};

type PlayerAggregateResponse = {
  matchesPlayed: number;
  stats: PlayerAggregateStats;
  timePlayed: number;
  username: string;
  uuid: string;
};

const fetchPlayer = createServerFn({ method: `GET` })
  .handler(async ({ data: player }: { data: string }) => {
    const response = await fetch(
      `${process.env.VITE_API_ROOT}/players/${encodeURIComponent(player)}`,
    );
    if (!response.ok) return undefined;
    const data = await response.json();
    return (data ?? undefined) as PlayerAggregateResponse | undefined;
  });

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const StatRow = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div className='flex items-center justify-between'>
    <span className='text-secondary-foreground/70'>{label}</span>
    <span className='font-medium'>
      {typeof value === `number` ? value.toLocaleString() : value}
    </span>
  </div>
);

const StatSection = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className='flex flex-col gap-2 rounded-lg bg-accent p-4'>
    <h2 className='text-lg font-semibold'>{title}</h2>
    {children}
  </div>
);

const RouteComponent = () => {
  const playerData = Route.useLoaderData();

  if (!playerData) {
    return (
      <div className='container mx-auto flex flex-col items-center justify-center gap-4 px-6 py-32'>
        <h1 className='text-4xl font-bold'>Player not found</h1>
        <p className='text-secondary-foreground/70'>
          The player you are looking for does not exist.
        </p>
        <Link className='text-primary underline' to='/'>
          Go home
        </Link>
      </div>
    );
  }

  const { stats } = playerData;

  return (
    <div className='container mx-auto flex flex-col gap-6 px-6 py-12 max-sm:px-4'>
      <div className='flex items-center gap-4'>
        <PlayerFace className='size-16' uuid={playerData.uuid} />
        <div>
          <h1 className='text-3xl font-bold'>{playerData.username}</h1>
          <p className='text-secondary-foreground/70'>
            {playerData.matchesPlayed} matches played &middot;{` `}
            {formatDuration(playerData.timePlayed)}
          </p>
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <StatSection title='Combat'>
          <StatRow label='Kills' value={stats.kills} />
          <StatRow label='Deaths' value={stats.deaths} />
          <StatRow label='Assists' value={stats.assists} />
          <StatRow label='Best Killstreak' value={stats.killstreak} />
          <StatRow
            label='Damage Dealt'
            value={Math.round(stats.damage_dealt)}
          />
          <StatRow
            label='Damage Taken'
            value={Math.round(stats.damage_taken)}
          />
        </StatSection>
        <StatSection title='Offense'>
          <StatRow label='Touchdowns' value={stats.touchdowns} />
          <StatRow label='Touchdown Passes' value={stats.touchdown_passes} />
          <StatRow label='Pickups' value={stats.pickups} />
          <StatRow label='Throws' value={stats.throws} />
          <StatRow label='Passes' value={stats.passes} />
          <StatRow label='Catches' value={stats.catches} />
        </StatSection>
        <StatSection title='Defense'>
          <StatRow label='Strips' value={stats.strips} />
          <StatRow
            label='Defensive Interceptions'
            value={stats.defensive_interceptions}
          />
          <StatRow
            label='Pass Interceptions'
            value={stats.pass_interceptions}
          />
          <StatRow
            label='Passing Blocks'
            value={Math.round(stats.passing_blocks)}
          />
          <StatRow
            label='Receive Blocks'
            value={Math.round(stats.receive_blocks)}
          />
          <StatRow
            label='Damage to Carrier'
            value={Math.round(stats.damage_carrier)}
          />
        </StatSection>
      </div>
    </div>
  );
};

export const Route = createFileRoute(`/$player`)({
  component: RouteComponent,
  loader: async ({ params }) => {
    const playerData = await fetchPlayer({ data: params.player });
    if (playerData && params.player !== playerData.username) {
      throw redirect({ to: `/$player`, params: { player: playerData.username } });
    }
    return playerData;
  },
});
