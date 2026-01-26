import { A } from '@solidjs/router';
import { clsx } from 'clsx';
import {
  createMemo,
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js';

import type { Player, TournamentData } from '@/utils/types';

import { Layout } from '@/components/layouts/the-layout';
import { ArrowRight, Crown, Swords, Users } from '@/icons';
import { formatReallyLongTime } from '@/utils';

type TournamentListItem = TournamentData & { id: number };

const useColumnCount = (breakpoints: {
  base: number;
  lg?: number;
  md?: number;
}) => {
  const [columnCount, setColumnCount] = createSignal(breakpoints.base);

  const updateColumns = () => {
    const width = globalThis.innerWidth;
    setColumnCount(
      width >= 1024 && breakpoints.lg !== undefined ? breakpoints.lg
      : width >= 768 && breakpoints.md !== undefined ? breakpoints.md
      : breakpoints.base,
    );
  };

  onMount(() => {
    updateColumns();
    globalThis.addEventListener(`resize`, updateColumns);
    onCleanup(() => globalThis.removeEventListener(`resize`, updateColumns));
  });

  return columnCount;
};

const getData = async (): Promise<TournamentListItem[]> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(new URL(`tournaments/all`, apiRoot));
  return res.status === 200 ? ((await res.json()) as TournamentListItem[]) : [];
};

const TournamentGrid = (props: { tournaments: TournamentListItem[] }) => {
  const columnCount = useColumnCount({ base: 1, lg: 3, md: 2 });

  const columns = createMemo(() => {
    const cols = columnCount();
    return props.tournaments
      .toSorted(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .reduce<TournamentListItem[][]>(
        (acc, item, i) => (acc[i % cols].push(item), acc),
        Array.from({ length: cols }, () => []),
      );
  });

  return (
    <div class='flex gap-4'>
      <For each={columns()}>
        {(col) => (
          <div class='flex w-full flex-1 flex-col gap-4'>
            <For each={col}>
              {(tournament) => <TournamentCard data={tournament} />}
            </For>
          </div>
        )}
      </For>
    </div>
  );
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
          when={tournaments()?.length}
        >
          <TournamentGrid tournaments={tournaments()!} />
        </Show>
      </Suspense>
    </Layout>
  );
};

const TournamentCard = (props: { data: TournamentListItem }) => (
  <A
    aria-label={`View ${props.data.name} tournament details`}
    class='group relative block overflow-hidden rounded-2xl transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
    href={`/tournaments/${props.data.id}`}
  >
    <div class='flex flex-col gap-5 rounded-2xl border border-white/6 bg-white/1 p-6 transition-all duration-300 group-hover:border-border-hover group-hover:bg-input group-hover:shadow-xl group-hover:shadow-black/20'>
      <div class='flex min-w-0 flex-col gap-1'>
        <h2 class='text-gray-12 truncate font-rubik text-lg font-black tracking-tight transition-colors group-hover:text-white'>
          {props.data.name}
        </h2>
        <time
          class='text-sm font-medium tracking-wide text-tertiary'
          dateTime={new Date(props.data.date).toISOString()}
        >
          {formatReallyLongTime(props.data.date)}
        </time>
      </div>

      <div
        aria-label='Participating teams'
        class='flex flex-col gap-2'
        role='list'
      >
        <For each={props.data.captains}>
          {(captain, i) => (
            <Team
              captain={captain}
              winner={i() + 1 === props.data.winnerTeamId}
            />
          )}
        </For>
      </div>

      <div class='mt-auto flex items-center justify-between border-t border-white/6 pt-5'>
        <div class='flex items-center gap-3'>
          <div
            aria-label={`${props.data.playerCount} players`}
            class='flex items-center gap-1.5 text-sm text-tertiary'
            title='Players'
          >
            <Users class='size-4 opacity-60' />
            <span class='font-medium tabular-nums'>
              {props.data.playerCount}
            </span>
          </div>
          <div aria-hidden='true' class='h-3 w-px bg-white/8' />
          <div
            aria-label={`${props.data.matchCount} matches`}
            class='flex items-center gap-1.5 text-sm text-tertiary'
            title='Matches'
          >
            <Swords class='size-4 opacity-60' />
            <span class='font-medium tabular-nums'>
              {props.data.matchCount}
            </span>
          </div>
        </div>

        <span class='flex items-center gap-1.5 text-sm font-medium text-tertiary transition-colors group-hover:text-secondary'>
          <span class='hidden sm:inline md:hidden xl:inline'>View</span>
          <ArrowRight class='size-4 transition-transform duration-200' />
        </span>
      </div>
    </div>
  </A>
);

const TournamentCardSkeleton = (props: { teamCount: number }) => (
  <div class='mb-4 flex break-inside-avoid flex-col gap-5 overflow-hidden rounded-2xl border border-white/6 bg-white/1 p-6'>
    <div class='flex flex-col gap-2'>
      <div class='h-6 w-40 animate-pulse rounded-lg bg-white/6' />
      <div class='h-4 w-24 animate-pulse rounded bg-white/3' />
    </div>

    <div class='flex flex-col gap-2'>
      <For each={Array.from({ length: props.teamCount })}>
        {() => (
          <div class='flex items-center gap-3 rounded-xl bg-white/2 px-3 py-2.5'>
            <div class='size-8 animate-pulse rounded-lg bg-white/6' />
            <div class='h-4 w-24 animate-pulse rounded bg-white/4' />
          </div>
        )}
      </For>
    </div>

    <div class='mt-auto flex items-center justify-between border-t border-white/6 pt-5'>
      <div class='flex items-center gap-3'>
        <div class='h-4 w-8 animate-pulse rounded bg-white/4' />
        <div class='h-3 w-px bg-white/8' />
        <div class='h-4 w-8 animate-pulse rounded bg-white/4' />
      </div>
      <div class='h-4 w-4 animate-pulse rounded bg-white/4' />
    </div>
  </div>
);

const Team = (props: { captain: Player; winner?: boolean }) => (
  <div
    class={clsx(
      `flex items-center gap-3 rounded-xl py-2.5 pr-4 pl-3`,
      props.winner ? `bg-amber-500/5` : `bg-white/2`,
    )}
    role='listitem'
  >
    <div class='shrink-0'>
      <img
        alt={`${props.captain.username}'s avatar`}
        class='size-8 object-cover'
        loading='lazy'
        src={`https://nmsr.nickac.dev/face/${props.captain.uuid}`}
      />
    </div>

    <span class='flex-1 truncate text-sm font-semibold text-secondary'>
      Team {props.captain.username}
    </span>

    <Show when={props.winner}>
      <Crown class='size-4 text-amber-400' />
    </Show>
  </div>
);

export default TournamentsPage;
