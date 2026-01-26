import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  CsvExportModule,
  DateFilterModule,
  EventApiModule,
  HighlightChangesModule,
  ModuleRegistry,
  NumberFilterModule,
  PaginationModule,
  TextFilterModule,
} from 'ag-grid-community';
import { createResource, onMount, Show, Suspense } from 'solid-js';

import type { Match, Matches, Player } from '@/utils/types';

import { Layout } from '@/components/layouts/the-layout';
import {
  capitalize,
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils';
import { gridTheme } from '@/utils/grid';

const getData = async (): Promise<Matches> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(new URL(`matches/all`, apiRoot));
  if (res.status !== 200) return [];
  return (await res.json()) as Matches;
};

// like yeah ik theres the type for this but like idc ts is not good
const linkCellRenderer = (params: { data: Match }) => html`
  <a
    href="/matches/${params.data.id.toString()}"
    class="text-blue-500 underline decoration-dotted"
  >
    #${params.data.id}
  </a>
`;

// same here
const playersCellRenderer = (params: { data: { players: Player[] } }) => {
  const div = document.createElement(`div`);
  div.setAttribute(
    `class`,
    `flex items-center h-full overflow-hidden w-[288px]`,
  );

  // so that the players don't change order every refresh
  // but idk if its better this way
  params.data.players.sort((_a, _b) => {
    const { a, b } = { a: _a.uuid, b: _b.uuid };
    return (
      a < b ? -1
      : a > b ? 1
      : 0
    );
  });

  if (params.data.players.length === 0) {
    div.innerHTML = `No Players`;
    return div;
  }
  params.data.players.slice(0, Math.floor(216 / 24)).forEach((player) => {
    const img = document.createElement(`img`);
    img.setAttribute(`alt`, `${player.username}'s Head`);
    img.setAttribute(`title`, `${player.username}'s Head`);
    img.setAttribute(`class`, `size-6 shrink-0`);
    img.setAttribute(`src`, `https://nmsr.nickac.dev/face/${player.uuid}?width=64`);
    div.append(img);
  });
  if (params.data.players.length > 9) {
    const len = params.data.players.length - 9;
    const span = document.createElement(`span`);
    span.setAttribute(`class`, `bg-card ml-2`);
    span.innerHTML = `+${len} more`;
    div.append(span);
  }
  return div;
};

const playerFilter = (params: {
  value: Array<{ username: string; uuid: string }>;
}) =>
  params.value && params.value.length > 0 ?
    params.value.map((player) => player.username).join(`, `)
  : ``;

const MatchesGrid = (props: { matches: Matches }) => {
  let theGrid: HTMLDivElement;

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      HighlightChangesModule,
      PaginationModule,
      DateFilterModule,
      TextFilterModule,
      NumberFilterModule,
      CsvExportModule,
      EventApiModule,
      ClientSideRowModelModule,
    ]);

    const grid = createGrid(theGrid!, {
      columnDefs: [
        {
          cellRenderer: linkCellRenderer,
          field: `id`,
          headerName: `#`,
          minWidth: 60,
          width: 60,
        },
        {
          field: `data.server`,
          filter: true,
          headerName: `Server`,
          minWidth: 120,
          suppressSizeToFit: false,
          valueFormatter: (v: { value: string }) =>
            v.value.replace(`tombrady`, `primary`),
          width: 120,
        },
        {
          cellRenderer: playersCellRenderer,
          field: `players`,
          filter: true,
          filterParams: {
            valueFormatter: playerFilter,
          },
          headerName: `Players`,
          keyCreator: (p: { value: { username: string } }) => p.value.username,
          minWidth: 300,
          sortable: false,
          valueFormatter: playerFilter,
        },
        {
          field: `data.map`,
          filter: true,
          headerName: `Map`,
          minWidth: 300,
          valueFormatter: (v: { value: string }) => v.value.toUpperCase(),
          width: 300,
        },
        {
          headerName: `Score`,
          minWidth: 100,
          sortable: false,
          suppressSizeToFit: false,
          valueFormatter: (v) =>
            `${v.data?.data.team_one_score} - ${v.data?.data.team_two_score}`,
          width: 100,
        },
        {
          field: `data.duration`,
          filter: `agNumberColumnFilter`,
          headerName: `Duration`,
          minWidth: 120,
          suppressSizeToFit: false,
          valueFormatter: (v: { value: number }) =>
            formatNumericalDuration(v.value),
          width: 120,
        },
        {
          field: `data.start_time`,
          filter: `agDateColumnFilter`,
          headerName: `Start Time`,
          minWidth: 340,
          valueFormatter: (v: { value: number }) =>
            capitalize(formatReallyLongTime(v.value)),
        },
      ],
      onGridReady: (ctx) => {
        if (window.innerWidth >= 1280) {
          ctx.api.sizeColumnsToFit();
        } else {
          ctx.api.autoSizeAllColumns();
        }
      },
      pagination: true,
      paginationPageSize: 20,
      rowData: props.matches.toSorted((a, b) => b.id - a.id),
      suppressDragLeaveHidesColumns: true,
      theme: gridTheme,
    });

    return () => {
      grid.destroy();
    };
  });

  return (
    <Layout
      description="Yep, that's literally all of the recent matches. You can still view previous matches by their links, of course."
      fillViewport
      title='Recent Matches'
    >
      <hr />
      <div class='min-h-96 flex-1'>
        <div
          class='ag-grid! ag-grid-issue-9239! h-full'
          data-ag-theme-mode='dark-blue'
          ref={theGrid!}
        />
      </div>
    </Layout>
  );
};

const MatchesPage = () => {
  const [matches] = createResource<Matches>(() => getData());

  return (
    <>
      <Suspense>
        <Show when={!matches()}>
          <div>not found / invalid data</div>
        </Show>
        <Show when={matches()}>
          <MatchesGrid matches={matches()!} />
        </Show>
      </Suspense>
    </>
  );
};

export default MatchesPage;
