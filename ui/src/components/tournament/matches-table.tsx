import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  type GridApi,
  ModuleRegistry,
  TextFilterModule,
} from 'ag-grid-community';
import { onCleanup, onMount } from 'solid-js';

import type { TournamentMatchData, TournamentTeam } from '@/utils/types';

import {
  capitalize,
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils';
import { getGridTheme } from '@/utils/grid';

const linkCellRenderer = (params: { data: TournamentMatchData }) => html`
  <a
    href="/matches/${params.data.matchId.toString()}"
    class="text-blue-500 underline decoration-dotted"
  >
    #${params.data.matchId}
  </a>
`;

const teamCellRenderer =
  (teams: TournamentTeam[], teamKey: `teamOneId` | `teamTwoId`) =>
  (params: { data: TournamentMatchData }) => {
    const teamId = params.data[teamKey];
    const team = teams.find((t) => t.id === teamId);
    return html`<span>Team ${team?.captain.username ?? teamId}</span>`;
  };

const scoreCellRenderer = (params: { data: TournamentMatchData }) => {
  const t1 = params.data.teamOneScore;
  const t2 = params.data.teamTwoScore;
  const t1Class = t1 > t2 ? `text-green-400 font-bold` : `text-secondary`;
  const t2Class = t2 > t1 ? `text-green-400 font-bold` : `text-secondary`;
  return html`<span
    ><span class="${t1Class}">${t1}</span> -
    <span class="${t2Class}">${t2}</span></span
  >`;
};

export const MatchesTable = (props: {
  matches: TournamentMatchData[];
  teams: TournamentTeam[];
}) => {
  let gridRef: HTMLDivElement | undefined;

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      TextFilterModule,
      ClientSideRowModelModule,
    ]);

    const grid: GridApi<TournamentMatchData> = createGrid(gridRef!, {
      autoSizeStrategy: { type: `fitGridWidth` },
      columnDefs: [
        {
          cellRenderer: linkCellRenderer,
          field: `matchId`,
          headerName: `Match`,
          minWidth: 80,
          sort: `asc`,
        },
        {
          field: `server`,
          filter: true,
          headerName: `Server`,
          minWidth: 120,
        },
        {
          cellRenderer: teamCellRenderer(props.teams, `teamOneId`),
          field: `teamOneId`,
          headerName: `Team 1`,
          minWidth: 150,
        },
        {
          cellRenderer: scoreCellRenderer,
          headerName: `Score`,
          minWidth: 80,
          sortable: false,
        },
        {
          cellRenderer: teamCellRenderer(props.teams, `teamTwoId`),
          field: `teamTwoId`,
          headerName: `Team 2`,
          minWidth: 150,
        },
        {
          field: `duration`,
          headerName: `Duration`,
          minWidth: 100,
          valueFormatter: (v: { value: number }) =>
            formatNumericalDuration(v.value),
        },
        {
          field: `startTime`,
          headerName: `Start Time`,
          minWidth: 280,
          valueFormatter: (v: { value: number }) =>
            capitalize(formatReallyLongTime(v.value)),
        },
      ],
      defaultColDef: { initialWidth: 100 },
      domLayout: `autoHeight`,
      onGridReady: (params) => params.api.autoSizeAllColumns(),
      rowData: props.matches,
      suppressDragLeaveHidesColumns: true,
      theme: getGridTheme(),
    });

    onCleanup(() => {
      grid.destroy();
    });
  });

  return (
    <section class='mt-16'>
      <div class='mb-4 flex items-center gap-3'>
        <h2 class='text-xl font-bold'>Tournament Matches</h2>
      </div>
      <div class='!ag-grid' data-ag-theme-mode='dark-blue' ref={gridRef} />
    </section>
  );
};
