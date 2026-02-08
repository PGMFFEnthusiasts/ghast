import { useParams } from '@solidjs/router';
import {
  createResource,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js';

import type { TournamentStatsData } from '@/utils/types';

import { HoverCard } from '@/components/hover-card';
import { Layout } from '@/components/layouts/the-layout';
import {
  AggregateStatsTable,
  AwardsSection,
  BLUE,
  BlueBackground,
  createResizeHandler,
  cycleStatMode,
  getAllTournamentYaw,
  getColumnCount,
  GOLD,
  GoldBackground,
  INDEX_COLORS,
  MatchesTable,
  MinecraftSkin,
  PlayerLabel,
  PlayerShowcase,
  PlayerStatsHover,
  Podium,
} from '@/components/tournament';
import { formatReallyLongTime } from '@/utils';

const getData = async (
  id: string,
): Promise<TournamentStatsData | undefined> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(new URL(`tournaments/${id}`, apiRoot));
  return res.status === 200 ?
      ((await res.json()) as TournamentStatsData)
    : undefined;
};

const TournamentDetailPage = () => {
  const params = useParams();
  const [tournament] = createResource(() => params.id, getData);

  return (
    <Suspense
      fallback={
        <Layout description='Please wait...' title='Loading...'>
          <div class='text-secondary'>Loading tournament...</div>
        </Layout>
      }
    >
      <Show
        fallback={
          <Layout
            description='The requested tournament could not be found.'
            title='Not Found'
          >
            <div class='text-secondary'>Tournament not found.</div>
          </Layout>
        }
        when={tournament()}
      >
        <TournamentDetailContent data={tournament()!} />
      </Show>
    </Suspense>
  );
};

const TournamentDetailContent = (props: { data: TournamentStatsData }) => {
  const winnerTeam = () =>
    props.data.teams.find((t) => t.id === props.data.winnerTeamId);

  const findPlayerData = (uuid: string) =>
    props.data.teams.flatMap((t) => t.players).find((p) => p.uuid === uuid);

  const [columns, setColumns] = createSignal(getColumnCount());

  onMount(() => {
    const handleResize = createResizeHandler(setColumns);
    globalThis.addEventListener(`resize`, handleResize);
    onCleanup(() => globalThis.removeEventListener(`resize`, handleResize));
  });

  return (
    <Layout
      description={
        <>
          <p class='text-secondary'>{formatReallyLongTime(props.data.date)}</p>
          <p class='text-lg font-semibold'>
            Winner:{` `}
            <span>Team {winnerTeam()?.captain.username ?? `Unknown`}</span>
          </p>
        </>
      }
      title={props.data.name}
    >
      <hr />
      <main class='flex w-full flex-col'>
        <AwardsSection>
          <div class='relative isolate'>
            <GoldBackground />
            <div class='pointer-events-none absolute inset-x-0 -top-4 z-0 flex items-start justify-center'>
              <h1 class='inline-block bg-linear-to-br from-[#FFDD00] to-[#FFDD55] bg-clip-text font-rubik text-9xl font-black text-transparent select-none md:text-[256px]'>
                MVP
              </h1>
              <h1
                aria-hidden='true'
                class='absolute top-0 left-1/2 -z-10 -translate-x-1/2 translate-y-2 font-rubik text-9xl font-black text-[#44474E] select-none md:translate-y-3 md:text-[256px]'
              >
                MVP
              </h1>
            </div>
            <div class='grid w-full grid-cols-1 gap-2 overflow-x-clip sm:grid-cols-2 md:grid-cols-3 md:grid-rows-2 md:overflow-visible'>
              <div class='z-1 flex items-end justify-center sm:col-span-2 sm:row-start-1 md:z-20 md:col-span-1 md:col-start-2 md:row-start-1'>
                <div class='relative flex aspect-1/2 scale-80 items-center justify-center sm:scale-90'>
                  <HoverCard
                    content={
                      findPlayerData(props.data.mvp.mvp.uuid) ?
                        <PlayerStatsHover
                          playerData={findPlayerData(props.data.mvp.mvp.uuid)!}
                        />
                      : <></>
                    }
                    glowColor={GOLD}
                    onClick={cycleStatMode}
                  >
                    <MinecraftSkin
                      height={500}
                      uuid={props.data.mvp.mvp.uuid}
                      yaw={0}
                    />
                  </HoverCard>
                  <Podium
                    color={GOLD}
                    depth={450}
                    id='mvp-center'
                    offsetY='-translate-y-32'
                  />
                  <PlayerLabel
                    class='bottom-30'
                    glowColor={GOLD}
                    label='Overall MVP'
                    username={props.data.mvp.mvp.username}
                  />
                </div>
              </div>
              <div class='z-2 scale-80 sm:row-start-2 sm:-mt-56 sm:scale-65 md:z-10 md:row-start-1 md:mt-0 md:scale-60 lg:scale-75 xl:scale-100'>
                <PlayerShowcase
                  depth={450}
                  glowColor={INDEX_COLORS.offense}
                  height={420}
                  label='Best Offensive Player'
                  player={props.data.mvp.opot}
                  playerData={findPlayerData(props.data.mvp.opot.uuid)}
                  yaw={
                    columns() === 3 ? 20
                    : columns() === 2 ?
                      20
                    : -20
                  }
                />
              </div>
              <div class='z-3 scale-80 sm:row-start-2 sm:-mt-56 sm:scale-65 md:z-10 md:row-start-1 md:mt-0 md:scale-60 lg:scale-75 xl:scale-100'>
                <PlayerShowcase
                  depth={450}
                  glowColor={INDEX_COLORS.defense}
                  height={420}
                  label='Best Defensive Player'
                  player={props.data.mvp.dpot}
                  playerData={findPlayerData(props.data.mvp.dpot.uuid)}
                  yaw={
                    columns() === 3 ? -20
                    : columns() === 2 ?
                      -20
                    : 20
                  }
                />
              </div>
              <div class='pointer-events-none z-3 flex scale-80 items-center justify-center sm:col-span-2 sm:row-start-3 sm:-mt-56 sm:scale-65 md:z-30 md:col-span-1 md:col-start-2 md:row-start-2 md:-mt-32 md:scale-75 lg:-mt-32 xl:scale-100'>
                <div class='pointer-events-auto'>
                  <PlayerShowcase
                    depth={columns() === 2 ? 270 : undefined}
                    glowColor={INDEX_COLORS.pvp}
                    height={380}
                    label='Best PvPer'
                    player={props.data.mvp.oldl}
                    playerData={findPlayerData(props.data.mvp.oldl.uuid)}
                    yaw={columns() === 1 ? -20 : 0}
                  />
                </div>
              </div>
              <div class='z-4 flex scale-80 items-center justify-center sm:row-start-4 sm:-mt-56 sm:scale-65 md:z-20 md:row-start-2 md:-mt-32 md:scale-75 md:items-start md:justify-end md:p-8 lg:-mt-32 xl:scale-100'>
                <PlayerShowcase
                  glowColor={INDEX_COLORS.passing}
                  height={380}
                  label='Best Passer'
                  player={props.data.mvp.passer}
                  playerData={findPlayerData(props.data.mvp.passer.uuid)}
                  yaw={20}
                />
              </div>
              <div class='z-5 flex scale-80 items-center justify-center sm:row-start-4 sm:-mt-56 sm:scale-65 md:z-20 md:row-start-2 md:-mt-32 md:scale-75 md:items-start md:justify-start md:p-8 lg:-mt-32 xl:scale-100'>
                <PlayerShowcase
                  glowColor={INDEX_COLORS.receiving}
                  height={380}
                  label='Best Receiver'
                  player={props.data.mvp.receiver}
                  playerData={findPlayerData(props.data.mvp.receiver.uuid)}
                  yaw={
                    columns() === 3 ? -20
                    : columns() === 2 ?
                      -20
                    : 0
                  }
                />
              </div>
            </div>
          </div>
        </AwardsSection>

        <AwardsSection class='mt-72'>
          <div class='relative isolate'>
            <BlueBackground />
            <h1 class='pointer-events-none absolute inset-x-0 top-0 -z-10 -translate-y-1/2 text-center font-rubik text-4xl leading-none font-black text-transparent select-none sm:text-6xl md:text-8xl lg:text-9xl xl:text-[144px] 2xl:text-[180px]'>
              <span class='bg-linear-to-br from-[#60A5FA] to-[#93C5FD] bg-clip-text'>
                ALL TOURNAMENT
              </span>
            </h1>
            <h1
              aria-hidden='true'
              class='pointer-events-none absolute inset-x-0 top-0 -z-20 -translate-y-[calc(50%-4px)] text-center font-rubik text-4xl leading-none font-black text-[#44474E] select-none sm:-translate-y-[calc(50%-8px)] sm:text-6xl md:text-8xl lg:text-9xl xl:text-[144px] 2xl:text-[180px]'
            >
              ALL TOURNAMENT
            </h1>
            <div class='flex w-full flex-wrap justify-center gap-x-6 gap-y-0'>
              <For each={props.data.allTournament}>
                {(player, index) => (
                  <div class='flex w-full scale-80 items-center justify-center sm:w-[calc(50%-0.75rem)] sm:scale-90 lg:w-[calc(33.333%-1rem)] lg:scale-75 xl:scale-90'>
                    <PlayerShowcase
                      depth={300}
                      glowColor={BLUE}
                      height={400}
                      label={`All Tournament #${index() + 1}`}
                      player={player}
                      playerData={findPlayerData(player.uuid)}
                      yaw={getAllTournamentYaw(index(), columns())}
                    />
                  </div>
                )}
              </For>
            </div>
          </div>
        </AwardsSection>

        <div class='mt-72'>
          <AggregateStatsTable
            players={props.data.teams.flatMap((team) => team.players)}
            teams={props.data.teams}
            winnerTeamId={props.data.winnerTeamId}
          />
        </div>

        <MatchesTable matches={props.data.matches} teams={props.data.teams} />
      </main>
    </Layout>
  );
};

export default TournamentDetailPage;
