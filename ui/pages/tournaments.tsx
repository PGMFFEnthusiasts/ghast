import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import { createResource, For, Show, Suspense } from 'solid-js';

import type { Player, TournamentData } from '@/utils/types';

import { Layout } from '@/components/layouts/the-layout';
import { Crown, Link, Swords, Users } from '@/icons';
import { formatReallyLongTime } from '@/utils';

type TournamentListItem = TournamentData & { id: number };

const getData = async (): Promise<TournamentListItem[]> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(new URL(`tournaments/all`, apiRoot));
  return res.status === 200 ? ((await res.json()) as TournamentListItem[]) : [];
};

const TournamentsPage = () => {
  const [tournaments] = createResource<TournamentListItem[]>(() => getData());

  return (
    <Layout description='What it says above.' title='Tournaments'>
      <hr />
      <Suspense
        fallback={
          <div class='columns-1 gap-4 md:columns-2 lg:columns-3'>
            <For
              each={Array.from(
                { length: 6 },
                () => [2, 4, 6][Math.floor(Math.random() * 3)],
              )}
            >
              {(teamCount) => <TournamentCardSkeleton teamCount={teamCount} />}
            </For>
          </div>
        }
      >
        <Show
          fallback={<div class='text-secondary'>No tournaments found.</div>}
          when={tournaments() && tournaments()!.length > 0}
        >
          <div class='columns-1 gap-4 md:columns-2 lg:columns-3'>
            <For each={tournaments()}>
              {(tournament) => <TournamentCard data={tournament} />}
            </For>
          </div>
        </Show>
      </Suspense>
    </Layout>
  );
};

const TournamentCard = (props: { data: TournamentListItem }) => (
  <div class='mb-4 flex break-inside-avoid flex-col gap-4 rounded-xl border border-white/6 bg-white/3 p-7'>
    <div class='flex flex-col'>
      <h1 class='text-xl font-black'>{props.data.name}</h1>
      <h2 class='text-secondary'>{formatReallyLongTime(props.data.date)}</h2>
    </div>
    <div class='flex flex-col gap-2'>
      <For each={props.data.captains}>
        {(captain, i) => (
          <Team captain={captain} winner={i() + 1 === props.data.winnerTeamId} />
        )}
      </For>
    </div>
    <div class='mt-2 flex items-center justify-between'>
      <span class='flex items-center gap-4 text-secondary'>
        <span class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5'>
          <Users class='size-6' />
          {` `}
          <span class='font-bold'>{props.data.playerCount}</span>
        </span>
        <span class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5'>
          <Swords class='size-6' />
          {` `}
          <span class='font-bold'>{props.data.matchCount}</span>
        </span>
      </span>
      <A
        class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5 text-secondary transition-colors hover:border-white/12 hover:bg-white/6 hover:text-primary'
        href={`/tournaments/${props.data.id}`}
      >
        <span class='hidden font-rubik sm:block md:hidden 2xl:block'>
          Go to Tournament
        </span>
        <Link class='-mt-[2px] size-6' />
      </A>
    </div>
  </div>
);

const TournamentCardSkeleton = (props: { teamCount: number }) => (
  <div class='mb-4 flex break-inside-avoid flex-col gap-4 rounded-xl border border-white/6 bg-white/3 p-7'>
    <div class='flex flex-col gap-2'>
      <div class='h-7 w-48 animate-pulse rounded bg-white/10' />
      <div class='h-5 w-32 animate-pulse rounded bg-white/6' />
    </div>
    <hr class='border-white/12' />
    <div class='flex flex-col gap-2'>
      <For each={Array.from({ length: props.teamCount })}>
        {() => (
          <div class='flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-3.5 pl-2'>
            <div class='size-8 animate-pulse rounded bg-white/10' />
            <div class='h-5 w-28 animate-pulse rounded bg-white/6' />
          </div>
        )}
      </For>
    </div>
    <hr class='border-white/12' />
    <div class='mt-2 flex items-center justify-between'>
      <span class='flex items-center gap-4'>
        <span class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5'>
          <div class='size-6 animate-pulse rounded bg-white/10' />
          <div class='h-5 w-6 animate-pulse rounded bg-white/6' />
        </span>
        <span class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5'>
          <div class='size-6 animate-pulse rounded bg-white/10' />
          <div class='h-5 w-6 animate-pulse rounded bg-white/6' />
        </span>
      </span>
      <span class='inline-flex items-center gap-2 rounded-lg border border-white/6 bg-white/3 py-2 pr-2 pl-2.5'>
        <div class='hidden h-5 w-28 animate-pulse rounded bg-white/6 sm:block md:hidden 2xl:block' />
        <div class='size-6 animate-pulse rounded bg-white/10' />
      </span>
    </div>
  </div>
);

const Team = (props: { captain: Player; winner?: boolean }) => (
  <div
    class={clsx(
      `flex items-center justify-between gap-2 rounded-lg border border-white/6 py-2 pr-3.5 pl-2`,
      props.winner ? `bg-amber-400/8` : `bg-white/3`,
    )}
  >
    <span class='inline-flex items-center gap-2'>
      <img
        class='size-8'
        src={`https://nmsr.nickac.dev/face/${props.captain.uuid}`}
      />
      <span class='font-bold text-secondary'>
        Team {props.captain.username}
      </span>
    </span>
    {props.winner && (
      <span>
        <Crown class='size-6 text-amber-400' />
      </span>
    )}
  </div>
);

export default TournamentsPage;
