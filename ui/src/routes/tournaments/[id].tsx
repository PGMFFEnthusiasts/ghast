import { createAsync, type RouteDefinition, useParams } from '@solidjs/router';
import { toPng } from 'html-to-image';
import {
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js';
import { Portal } from 'solid-js/web';

import type { MvpSkins } from '@/components/tournament';
import type { TournamentDetailedData } from '@/utils/types';

import { Button } from '@/components/button';
import { Layout } from '@/components/layouts/the-layout';
import {
  AggregateStatsTable,
  AwardsSection,
  BG_COLOR,
  BLUE,
  BlueBackground,
  createResizeHandler,
  getAllTournamentYaw,
  getColumnCount,
  GOLD,
  GoldBackground,
  loadAllTournamentSkins,
  loadMvpSkins,
  MatchesTable,
  MinecraftSkin,
  nextFrame,
  PlayerLabel,
  PlayerShowcase,
  Podium,
} from '@/components/tournament';
import { Image } from '@/icons';
import { formatReallyLongTime } from '@/utils';
import { getTournamentDetail } from '@/utils/api';

export const route = {
  preload: ({ params }) => getTournamentDetail(params.id),
} satisfies RouteDefinition;

const TournamentDetailPage = () => {
  const params = useParams();
  const tournament = createAsync(() => getTournamentDetail(params.id));

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

const TournamentDetailContent = (props: { data: TournamentDetailedData }) => {
  const winnerTeam = () =>
    props.data.teams.find((t) => t.id === props.data.winnerTeamId);

  const [columns, setColumns] = createSignal(getColumnCount());
  const [exportView, setExportView] = createSignal<`allTournament` | `mvp`>();
  const [exportMvpSkins, setExportMvpSkins] = createSignal<MvpSkins>();
  const [exportAllTournamentSkins, setExportAllTournamentSkins] =
    createSignal<string[]>();
  let exportRef: HTMLDivElement | undefined;

  const captureExport = async (filename: string) => {
    await nextFrame();
    await nextFrame();
    if (!exportRef) return;

    const dataUrl = await toPng(exportRef, {
      backgroundColor: BG_COLOR,
      pixelRatio: 3,
    });
    setExportView(undefined);

    const link = document.createElement(`a`);
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportMvp = async () => {
    const skins = await loadMvpSkins(props.data.mvp);
    setExportMvpSkins(skins);
    setExportView(`mvp`);
    void captureExport(`${props.data.name}-mvp`);
  };

  const exportAllTournament = async () => {
    const skins = await loadAllTournamentSkins(props.data.allTournament);
    setExportAllTournamentSkins(skins);
    setExportView(`allTournament`);
    void captureExport(`${props.data.name}-all-tournament`);
  };

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
          <div class='flex justify-end pb-2'>
            <Button aria-label='Export MVP as image' onClick={exportMvp}>
              <Image class='size-5' />
            </Button>
          </div>
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
                  <MinecraftSkin
                    height={500}
                    uuid={props.data.mvp.mvp.uuid}
                    yaw={0}
                  />
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
                  glowColor='#A855F7'
                  height={420}
                  label='Best Offensive Player'
                  player={props.data.mvp.opot}
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
                  glowColor='#22C55E'
                  height={420}
                  label='Best Defensive Player'
                  player={props.data.mvp.dpot}
                  yaw={
                    columns() === 3 ? -20
                    : columns() === 2 ?
                      -20
                    : 20
                  }
                />
              </div>
              <div class='z-3 flex scale-80 items-center justify-center sm:col-span-2 sm:row-start-3 sm:-mt-56 sm:scale-65 md:z-30 md:col-span-1 md:col-start-2 md:row-start-2 md:-mt-32 md:scale-75 lg:-mt-32 xl:scale-100'>
                <PlayerShowcase
                  depth={columns() === 2 ? 270 : undefined}
                  glowColor='#EF4444'
                  height={380}
                  label='Best PvPer'
                  player={props.data.mvp.oldl}
                  yaw={columns() === 1 ? -20 : 0}
                />
              </div>
              <div class='z-4 flex scale-80 items-center justify-center sm:row-start-4 sm:-mt-56 sm:scale-65 md:z-20 md:row-start-2 md:-mt-32 md:scale-75 md:items-start md:justify-end md:p-8 lg:-mt-32 xl:scale-100'>
                <PlayerShowcase
                  glowColor='#3B82F6'
                  height={380}
                  label='Best Passer'
                  player={props.data.mvp.passer}
                  yaw={20}
                />
              </div>
              <div class='z-5 flex scale-80 items-center justify-center sm:row-start-4 sm:-mt-56 sm:scale-65 md:z-20 md:row-start-2 md:-mt-32 md:scale-75 md:items-start md:justify-start md:p-8 lg:-mt-32 xl:scale-100'>
                <PlayerShowcase
                  glowColor='#F97316'
                  height={380}
                  label='Best Receiver'
                  player={props.data.mvp.receiver}
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
          <div class='flex justify-end pb-2'>
            <Button
              aria-label='Export All Tournament as image'
              onClick={exportAllTournament}
            >
              <Image class='size-5' />
            </Button>
          </div>
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
                      label='All Tournament'
                      player={player}
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

      <Portal>
        <Show when={exportView()}>
          <div class='fixed top-0 left-[-9999px] w-[1200px] bg-[#0B101A]'>
            <Show when={exportView() === `mvp` && exportMvpSkins()}>
              <div
                class='relative isolate h-[1050px] px-16 pt-16 pb-32'
                ref={exportRef}
              >
                <GoldBackground exportMode noiseOpacity='opacity-30' />
                <div class='pointer-events-none absolute inset-x-0 top-0 z-0 flex items-start justify-center'>
                  <h1 class='inline-block bg-linear-to-br from-[#FFDD00] to-[#FFDD55] bg-clip-text font-rubik text-[280px] font-black text-transparent select-none'>
                    MVP
                  </h1>
                  <h1
                    aria-hidden='true'
                    class='absolute top-0 left-1/2 -z-10 -translate-x-1/2 translate-y-3 font-rubik text-[280px] font-black text-[#44474E] select-none'
                  >
                    MVP
                  </h1>
                </div>
                <div class='-mb-40 grid w-full grid-cols-3 grid-rows-2 gap-2'>
                  <div class='z-10 scale-90'>
                    <PlayerShowcase
                      depth={450}
                      exportBlur
                      glowColor='#A855F7'
                      height={420}
                      label='Best Offensive Player'
                      player={props.data.mvp.opot}
                      skinSrc={exportMvpSkins()!.opot}
                    />
                  </div>
                  <div class='z-20 flex items-end justify-center'>
                    <div class='relative flex aspect-1/2 items-center justify-center'>
                      <MinecraftSkin height={500} src={exportMvpSkins()!.mvp} />
                      <Podium
                        color={GOLD}
                        depth={450}
                        id='mvp-center-export'
                        offsetY='-translate-y-32'
                      />
                      <PlayerLabel
                        class='bottom-30'
                        exportBlur
                        glowColor={GOLD}
                        label='Overall MVP'
                        username={props.data.mvp.mvp.username}
                      />
                    </div>
                  </div>
                  <div class='z-10 scale-90'>
                    <PlayerShowcase
                      depth={450}
                      exportBlur
                      glowColor='#22C55E'
                      height={420}
                      label='Best Defensive Player'
                      player={props.data.mvp.dpot}
                      skinSrc={exportMvpSkins()!.dpot}
                    />
                  </div>
                  <div class='z-20 -mt-48 flex scale-80 items-start justify-end p-8'>
                    <PlayerShowcase
                      exportBlur
                      glowColor='#3B82F6'
                      height={380}
                      label='Best Passer'
                      player={props.data.mvp.passer}
                      skinSrc={exportMvpSkins()!.passer}
                    />
                  </div>
                  <div class='z-30 -mt-48 flex scale-80 items-center justify-center'>
                    <PlayerShowcase
                      exportBlur
                      glowColor='#EF4444'
                      height={380}
                      label='Best PvPer'
                      player={props.data.mvp.oldl}
                      skinSrc={exportMvpSkins()!.oldl}
                    />
                  </div>
                  <div class='z-20 -mt-48 flex scale-80 items-start justify-start p-8'>
                    <PlayerShowcase
                      exportBlur
                      glowColor='#F97316'
                      height={380}
                      label='Best Receiver'
                      player={props.data.mvp.receiver}
                      skinSrc={exportMvpSkins()!.receiver}
                    />
                  </div>
                </div>
              </div>
            </Show>
            <Show
              when={
                exportView() === `allTournament` && exportAllTournamentSkins()
              }
            >
              <div
                class='relative isolate overflow-hidden px-16 pt-28 pb-80'
                ref={exportRef}
              >
                <BlueBackground exportMode noiseOpacity='opacity-50' />
                <h1 class='pointer-events-none absolute inset-x-0 top-4 -z-10 text-center font-rubik text-[140px] leading-none font-black text-transparent select-none'>
                  <span class='bg-linear-to-br from-[#60A5FA] to-[#93C5FD] bg-clip-text'>
                    ALL TOURNAMENT
                  </span>
                </h1>
                <h1
                  aria-hidden='true'
                  class='pointer-events-none absolute inset-x-0 top-4 -z-20 translate-y-2 text-center font-rubik text-[140px] leading-none font-black text-[#44474E] select-none'
                >
                  ALL TOURNAMENT
                </h1>
                <div class='flex w-full flex-wrap justify-center gap-x-6'>
                  <For each={props.data.allTournament}>
                    {(player, index) => (
                      <div class='-my-10 flex w-[calc(33.333%-1rem)] scale-90 items-center justify-center'>
                        <PlayerShowcase
                          depth={300}
                          exportBlur
                          glowColor={BLUE}
                          height={400}
                          label='All Tournament'
                          player={player}
                          skinSrc={exportAllTournamentSkins()![index()]}
                        />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </div>
        </Show>
      </Portal>
    </Layout>
  );
};

export default TournamentDetailPage;
