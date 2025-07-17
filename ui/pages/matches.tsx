import { A } from '@solidjs/router';
import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  CsvExportModule,
  EventApiModule,
  HighlightChangesModule,
  type ICellRendererParams,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
} from 'ag-grid-community';
import { createResource, onMount, Show, Suspense } from 'solid-js';

import type { Match, RecentMatches } from '@/utils/types';

import {
  capitalize,
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils/utils';

const getData = async (): Promise<RecentMatches> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(apiRoot + `matches/recent`);
  if (res.status !== 200) return [];
  return (await res.json()) as RecentMatches;
};

const linkCellRenderer = (params: ICellRendererParams<Match>) => html`
  <a
    href="/matches/${params.data!.id}"
    class="text-blue-500 underline decoration-dotted"
  >
    Match #${params.data!.id}
  </a>
`;

const Matches = (props: { matches: RecentMatches }) => {
  let theGrid: HTMLDivElement;

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      HighlightChangesModule,
      TextFilterModule,
      NumberFilterModule,
      CsvExportModule,
      EventApiModule,
      ClientSideRowModelModule,
    ]);
    const grid = createGrid(theGrid!, {
      autoSizeStrategy: {
        type: `fitGridWidth`,
      },
      columnDefs: [
        { field: `id`, headerName: `#`, width: 80 },
        {
          field: `data.map`,
          filter: true,
          headerName: `Map`,
          valueFormatter: (v) => v.value.toUpperCase(),
        },
        { field: `data.server`, filter: true, headerName: `Server` },
        {
          field: `data.start_time`,
          headerName: `Start Time`,
          valueFormatter: (v) => capitalize(formatReallyLongTime(v.value)),
          width: 400,
        },
        {
          field: `data.duration`,
          filter: true,
          headerName: `Duration`,
          valueFormatter: (v) => formatNumericalDuration(v.value),
        },
        {
          headerName: `Score`,
          sortable: false,
          valueFormatter: (v) =>
            `${v.data?.data.team_one_score} - ${v.data?.data.team_two_score}`,
        },
        {
          cellRenderer: linkCellRenderer,
          headerName: `Link`,
          sortable: false,
        },
      ],
      domLayout: `autoHeight`,
      rowData: props.matches.sort((a, b) => b.id - a.id),
    });

    return () => {
      grid.destroy();
    };
  });

  return (
    <div class='container mx-auto flex min-h-screen flex-col space-y-4 p-2 xl:p-4'>
      <div>
        <A
          class='opacity-50 transition-opacity duration-200 hover:opacity-100'
          href='/'
        >
          ← The{` `}
          <span class='rounded bg-red-300 px-2 py-1 font-black'>OFFICIAL</span>
          {` `}
          TB "Work In Progress" Homepage
        </A>
        <div class='mt-2 text-2xl font-bold'>Recent Matches</div>
        <div class='opacity-50'>
          Yep, that's literally all of the recent matches. You can still view
          previous matches by their links, of course.
        </div>
      </div>
      <hr class='text-gray-200' />
      <div class='flex-1'>
        <div class='h-full' ref={theGrid!} />
      </div>
    </div>
  );
};

const MatchesPage = () => {
  const [data] = createResource<RecentMatches>(() => getData());

  return (
    <>
      <Suspense>
        <Show when={!data()}>
          <div>not found / invalid data</div>
        </Show>
        <Show when={data()}>
          <Matches matches={data()!} />
        </Show>
      </Suspense>
    </>
  );
};

export default MatchesPage;
