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
  PaginationModule,
  TextFilterModule,
} from 'ag-grid-community';
import { createResource, onMount, Show, Suspense } from 'solid-js';

import type { Match, RecentMatches } from '@/utils/types';

import {
  capitalize,
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils';
import { gridTheme } from '@/utils/grid';
import { useTheme } from '@/utils/use-theme';

const getData = async (): Promise<RecentMatches> => {
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(new URL(`matches/all`, apiRoot));
  if (res.status !== 200) return [];
  return (await res.json()) as RecentMatches;
};

const linkCellRenderer = (params: ICellRendererParams<Match>) => html`
  <a
    href="/matches/${params.data!.id}"
    class="text-blue-500 underline decoration-dotted"
  >
    #${params.data!.id}
  </a>
`;

const Matches = (props: { matches: RecentMatches }) => {
  let theGrid: HTMLDivElement;

  const theme = useTheme();

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      HighlightChangesModule,
      PaginationModule,
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
          width: 40,
        },
        {
          field: `data.server`,
          filter: true,
          headerName: `Server`,
          suppressSizeToFit: false,
          valueFormatter: (v: { value: string }) =>
            v.value.replace(`tombrady`, `primary`),
          width: 60,
        },
        {
          field: `data.map`,
          filter: true,
          headerName: `Map`,
          minWidth: 300,
          valueFormatter: (v: { value: string }) => v.value.toUpperCase(),
        },
        {
          headerName: `Score`,
          sortable: false,
          suppressSizeToFit: false,
          valueFormatter: (v) =>
            `${v.data?.data.team_one_score} - ${v.data?.data.team_two_score}`,
          width: 60,
        },
        {
          field: `data.duration`,
          filter: true,
          headerName: `Duration`,
          suppressSizeToFit: false,
          valueFormatter: (v: { value: number }) =>
            formatNumericalDuration(v.value),
          width: 60,
        },
        {
          field: `data.start_time`,
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
      rowData: props.matches.sort((a, b) => b.id - a.id),
      suppressDragLeaveHidesColumns: true,
      theme: gridTheme,
    });

    return () => {
      grid.destroy();
    };
  });

  return (
    <div class='container mx-auto flex h-screen flex-col space-y-4 p-4 xl:p-8'>
      <div class='flex flex-col'>
        <A
          class='group text-primary/60 transition-colors duration-200 hover:text-primary'
          href='/'
        >
          ← The{` `}
          <span class='rounded bg-red-500/35 px-2 py-1 font-black transition-colors duration-200 group-hover:bg-red-500/50'>
            OFFICIAL
          </span>
          {` `}
          TB "Work In Progress" Homepage
        </A>
        <div class='mt-2 text-2xl font-bold'>Recent Matches</div>
        <div class='text-secondary'>
          Yep, that's literally all of the recent matches. You can still view
          previous matches by their links, of course.
        </div>
      </div>
      <hr />
      <div class='flex-1'>
        <div
          class='h-full'
          data-ag-theme-mode={theme().replace(`dark`, `dark-blue`)}
          ref={theGrid!}
        />
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
