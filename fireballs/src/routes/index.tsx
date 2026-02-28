import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import {
  ArrowRight,
  BookOpenText,
  Clock,
  Map,
  User,
  Users,
} from 'lucide-react';

import { Discord } from '@/src/components/icons/discord';
import { MapCard } from '@/src/components/map-card';
import { PlayerFace } from '@/src/components/player-face';
import { buttonVariants } from '@/src/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/src/components/ui/carousel';
import { cn, dayjs } from '@/src/lib/utils';

type MatchData = {
  duration: number;
  is_tourney: boolean;
  map: string;
  server: string;
  start_time: number;
  team_one_color: number | null;
  team_one_name: string;
  team_one_score: number;
  team_two_color: number | null;
  team_two_name: string;
  team_two_score: number;
  winner: number;
};

type MatchPlayer = {
  username: string;
  uuid: string;
};

type Match = {
  data: MatchData;
  id: number;
  players: MatchPlayer[];
};
type Player = { fireballs: number; username: string; uuid: string };
type Tournament = {
  map: string;
  name: string;
  players: number;
  teams: number;
  timeLimit: number;
};

const fetchRecentMatches = createServerFn({ method: `GET` }).handler(
  async () => {
    const response = await fetch(
      `${process.env.VITE_API_ROOT}/matches/recent`,
    );
    if (!response.ok) return [];
    return response.json() as Promise<Match[]>;
  },
);

const richestQueryOptions = queryOptions({
  queryFn: () =>
    new Promise<Player[]>((resolve) => {
      setTimeout(() => {
        resolve(
          [
            {
              fireballs: 51_925_141,
              username: `mmmmmmmmmmmmmmmm`,
              uuid: `c35c887d-a32e-4852-8747-9f2d853fbcbc`,
            },
            {
              fireballs: 51_925_141,
              username: `Kunet`,
              uuid: `e419983c-bb20-438d-b900-717f131a272f`,
            },
            {
              fireballs: 51_925_141,
              username: `Obaro`,
              uuid: `1c6ea6c0-3400-4ea4-942a-8e204d6aa576`,
            },
            {
              fireballs: 51_925_141,
              username: `Necrozma`,
              uuid: `534470be-4122-4762-83e1-f45abb474cdc`,
            },
            {
              fireballs: 51_925_141,
              username: `Feckerful`,
              uuid: `1a11c247-fc39-4fe1-9c49-03088ddb4b3d`,
            },
          ].toSorted((a, b) => b.fireballs - a.fireballs),
        );
      }, 1000);
    })
      .then((r) => r)
      .catch(() => []),
  queryKey: [`richest`],
});

const tournamentQueryOptions = queryOptions({
  queryFn: () =>
    new Promise<Tournament>((resolve) => {
      setTimeout(() => {
        resolve({
          map: `Fireballs Bowl: Ultimate Frisbee`,
          name: `Draft Tournament XXI`,
          players: 20,
          teams: 4,
          timeLimit: 440,
        });
      }, 1000);
    }),
  queryKey: [`tournament`],
});

const App = () => {
  const { matches } = Route.useLoaderData();
  const { data: richestPlayers } = useSuspenseQuery(richestQueryOptions);
  const { data: latestTournament } = useSuspenseQuery(tournamentQueryOptions);

  return (
    <>
      <section>
        <div className='relative container mx-auto flex-col items-center justify-center px-6 py-32 max-sm:px-4 lg:flex lg:py-48'>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-col text-center text-3xl font-black sm:text-4xl md:text-4xl lg:text-6xl'>
              <span>The centralized hub</span>
              <span>for all things Brady</span>
            </div>
            <div className='flex items-center justify-center gap-2'>
              <a
                className={cn(
                  buttonVariants({ variant: `secondary` }),
                  `bg-[#5865F2] text-white hover:bg-[#454FBF]`,
                )}
                href='https://discord.com/invite/YYYtfhDGUM'
                rel='noopener noreferrer'
                target='_blank'
              >
                Join the <Discord />
              </a>
              <Link
                className={cn(buttonVariants({ variant: `outline` }))}
                to='/rules'
              >
                <BookOpenText /> Read the rules
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className='pb-32'>
        <div className='container mx-auto flex flex-col gap-6 px-6 max-sm:px-4'>
          <div className='flex'>
            <div className='flex min-w-0 flex-1 flex-col gap-4 xl:flex-row xl:gap-1'>
              <div className='flex flex-4 flex-col gap-1 max-xl:aspect-video'>
                <span className='ml-2 flex items-end gap-2 text-xl sm:text-2xl'>
                  <h2 className='font-medium'>Featured Event</h2>
                  <Link className='text-secondary-foreground/40' to='/events'>
                    see past events
                  </Link>
                </span>
                <div className='flex h-full flex-col gap-2 rounded-lg bg-accent p-4'>
                  <header>
                    <h3 className='text-2xl font-bold sm:text-4xl'>
                      Draft Tournament XXI
                    </h3>
                  </header>
                  <hr />
                  <div className='flex grow flex-col gap-1 text-lg text-secondary-foreground/70 sm:text-xl'>
                    <span className='flex items-center gap-1.5'>
                      <Map />
                      {latestTournament.map}
                    </span>
                    <span className='flex items-center gap-1.5'>
                      <Clock />
                      {`${Math.floor(latestTournament.timeLimit / 60)} minutes ${
                        latestTournament.timeLimit % 60 &&
                        `and
                      ${latestTournament.timeLimit % 60} seconds`
                      }`}
                    </span>
                    <div className='flex gap-2'>
                      <span className='flex items-center gap-1.5'>
                        <Users />
                        <span>{latestTournament.teams} teams</span>
                      </span>
                      |
                      <span className='flex items-center gap-1.5'>
                        <User />
                        <span>{latestTournament.players} players</span>
                      </span>
                    </div>
                  </div>
                  <footer className='flex'>
                    <Link className='ml-auto inline-flex' to='/'>
                      Place Bets <ArrowRight />
                    </Link>
                  </footer>
                </div>
              </div>
              <div className='flex flex-6 flex-col gap-2 md:flex-row md:gap-1 xl:flex-col xl:gap-2 2xl:flex-row 2xl:gap-1'>
                <div className='flex flex-1 flex-col gap-1'>
                  <span className='ml-2 flex items-end gap-2 text-2xl'>
                    <h2 className='font-medium'>Recent Matches</h2>
                    <Link className='text-secondary-foreground/40' to='/'>
                      see more
                    </Link>
                  </span>
                  {matches.map((match) => (
                    <RecentMatch key={match.id} match={match} />
                  ))}
                </div>
                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                  <span className='ml-2 flex items-end gap-2 text-2xl'>
                    <h2 className='font-medium'>Richest Players</h2>
                  </span>
                  {richestPlayers.map((player) => (
                    <RichPlayer key={player.uuid} player={player} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <h2 className='ml-2 text-2xl font-medium text-nowrap'>Servers</h2>
            <div className='flex flex-col gap-1 rounded-lg md:flex-row md:flex-wrap'>
              <div className='aspect-video flex-1 rounded-lg bg-secondary p-4'>
                <h3 className='text-3xl'>Tron Brady</h3>
                <h4 className='text-xl text-secondary-foreground'>Server 1</h4>
              </div>
              <div className='aspect-video flex-1 rounded-lg bg-secondary p-4'>
                <h3 className='text-3xl'>Tron Brady</h3>
                <h4 className='text-xl text-secondary-foreground'>Server 2</h4>
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            <span className='ml-2 flex items-end gap-2 text-2xl'>
              <h2 className='font-medium'>Maps</h2>
              <Link className='text-secondary-foreground/40' to='/'>
                see all
              </Link>
            </span>
            <Carousel opts={{ loop: true }}>
              <CarouselContent>
                <CarouselItem>
                  <MapCard
                    data={{
                      authors: [
                        {
                          name: `TommyHillfigger`,
                          uuid: `c31e94b2-7678-4551-847e-989c1423323a`,
                        },
                        {
                          name: `MewTwoKing`,
                          uuid: `b390b87a-47e8-40d8-968a-9e7e2582a88b`,
                        },
                        {
                          name: `KuNet`,
                          uuid: `e419983c-bb20-438d-b900-717f131a272f`,
                        },
                      ],
                      contributors: [
                        {
                          contribution: `XML`,
                          name: `Furrie`,
                          uuid: `1159eea6-5e77-4944-aa2e-57d2fca91882`,
                        },
                        {
                          contribution: `Bridge Snippets`,
                          name: `zzuf`,
                          uuid: `9d4779a8-d35f-45d2-b51c-95de7a77e128`,
                        },
                        {
                          contribution: `XML Refinements`,
                          name: `arcadeboss`,
                          uuid: `c25a6f7b-4c42-40da-8cd6-add53f0c84eb`,
                        },
                      ],
                      image: `/maps/brady_block.webp`,
                      stats: {
                        maxPlayers: `12 (6v6)`,
                        releaseDate: `2025-07-25`,
                        size: { height: 49, width: 111 },
                      },
                      title: `Brady Block: High IQ Color palette`,
                    }}
                  />
                </CarouselItem>
                <CarouselItem>
                  <MapCard
                    data={{
                      authors: [
                        {
                          name: `jcane`,
                          uuid: `f610e558-a3c8-44fb-8622-68cc49dbc18f`,
                        },
                      ],
                      contributors: [
                        {
                          contribution: ``,
                          name: `mameBT`,
                          uuid: `430ec559-364a-4363-ac7a-2529050440ac`,
                        },
                      ],
                      image: `/maps/fbbowl.webp`,
                      stats: {
                        maxPlayers: `40 (20-20)`,
                        releaseDate: `2025-12-26`,
                        size: { height: 79, width: 135 },
                      },
                      title: `Fireballs Bowl`,
                    }}
                  />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="max-xl:hidden"/>
              <CarouselNext   className="max-xl:hidden"/>
            </Carousel>
          </div>
        </div>
      </section>
      <section className='bg-zinc-800'></section>
    </>
  );
};

const RecentMatch = ({ match }: { match: Match }) => (
  <div className='flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg bg-accent p-4 sm:rounded-lg'>
    <h3 className='min-w-0 text-lg font-bold max-md:truncate sm:text-xl lg:text-2xl'>
      {match.data.map}
    </h3>
    <div className='flex items-center gap-2'>
      <span className='text-lg text-nowrap text-secondary-foreground/50 lg:text-xl'>
        {dayjs().to(dayjs(new Date(match.data.start_time)))}
      </span>
      <ArrowRight className='size-6 shrink-0' />
    </div>
  </div>
);

const RichPlayer = ({ player }: { player: Player }) => (
  <Link
    className='flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md bg-accent p-2 sm:rounded-lg md:p-4'
    params={{ player: player.username }}
    to='/$player'
  >
    <div className='flex min-w-0 items-center gap-1.5 md:gap-2'>
      <PlayerFace className='size-6 shrink-0 md:size-8' uuid={player.uuid} />
      <h3 className='min-w-0 truncate font-bold md:text-xl xl:text-2xl'>
        {player.username}
      </h3>
    </div>
    <span className='flex items-center gap-1 text-sm font-medium md:text-lg'>
      {Intl.NumberFormat(`en-US`).format(player.fireballs)}
      <img className='size-8 shrink-0' src='/assets/fireball.webp' />
    </span>
  </Link>
);

export const Route = createFileRoute(`/`)({
  component: App,
  loader: async ({ context }) => {
    const [matches] = await Promise.all([
      fetchRecentMatches(),
      context.queryClient.ensureQueryData(richestQueryOptions),
      context.queryClient.ensureQueryData(tournamentQueryOptions),
    ]);
    return { matches };
  },
});
