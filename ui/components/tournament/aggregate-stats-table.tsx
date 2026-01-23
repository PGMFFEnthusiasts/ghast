import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  CsvExportModule,
  type GridApi,
  ModuleRegistry,
  TextFilterModule,
} from 'ag-grid-community';
import { createSignal, onMount } from 'solid-js';
import { toast } from 'solid-sonner';

import type { PlayerData, TournamentTeam } from '@/utils/types';

import { Button } from '@/components/button';
import { Csv } from '@/icons';
import { divHtml as html } from '@/utils';
import { gridTheme } from '@/utils/grid';

const TEAM_COLORS = [
  `text-red-400`,
  `text-blue-400`,
  `text-green-400`,
  `text-yellow-400`,
  `text-purple-400`,
  `text-orange-400`,
];

const getTeamColor = (teamIndex: number) =>
  TEAM_COLORS[teamIndex % TEAM_COLORS.length];

const nameCellRenderer =
  (winnerTeamId: number | undefined) =>
  (params: { data: PlayerData; value: string }) => {
    const teamColor = getTeamColor(params.data.stats.team);
    const isWinner =
      winnerTeamId !== undefined && params.data.stats.team === winnerTeamId;
    return html`
      <span class="${teamColor} flex items-center gap-2 font-medium">
        <img
          alt="${params.data.username}'s Head"
          class="aspect-square size-6"
          src="https://nmsr.nickac.dev/face/${params.data.uuid}"
        />${params.value}${isWinner ?
          `<svg class="size-4 text-yellow-400 ml-auto shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294zM5 21h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`
        : ``}
      </span>
    `;
  };

const teamCellRenderer =
  (teams: TournamentTeam[]) => (params: { data: PlayerData }) => {
    const teamId = params.data.stats.team;
    const team = teams.find((t) => t.id === teamId);
    const teamColor = getTeamColor(teamId);
    return html`<span class="${teamColor}"
      >Team ${team?.captain.username ?? teamId}</span
    >`;
  };

export const AggregateStatsTable = (props: {
  players: PlayerData[];
  teams: TournamentTeam[];
  winnerTeamId?: number;
}) => {
  let gridRef: HTMLDivElement | undefined;
  const [currentGrid, setCurrentGrid] = createSignal<GridApi<PlayerData>>();

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      TextFilterModule,
      CsvExportModule,
      ClientSideRowModelModule,
    ]);

    const grid: GridApi<PlayerData> = createGrid(gridRef!, {
      autoSizeStrategy: { type: `fitCellContents` },
      columnDefs: [
        {
          cellRenderer: teamCellRenderer(props.teams),
          field: `stats.team`,
          filter: true,
          headerName: `Team`,
          sort: `asc`,
          sortIndex: 0,
        },
        {
          cellRenderer: nameCellRenderer(props.winnerTeamId),
          field: `username`,
          headerName: `Player`,
          pinned: `left`,
        },
        {
          field: `stats.kills`,
          headerName: `Kills`,
          sort: `desc`,
          sortIndex: 1,
        },
        { field: `stats.deaths`, headerName: `Deaths` },
        { field: `stats.assists`, headerName: `Assists` },
        { field: `stats.killstreak`, headerName: `Streak` },
        {
          field: `stats.damage_dealt`,
          headerName: `DMG Out`,
          valueFormatter: (v) =>
            typeof v.value === `number` ? v.value.toFixed(2) : `0`,
        },
        {
          field: `stats.damage_taken`,
          headerName: `DMG In`,
          valueFormatter: (v) =>
            typeof v.value === `number` ? v.value.toFixed(2) : `0`,
        },
        { field: `stats.pickups`, headerName: `Pickups` },
        { field: `stats.throws`, headerName: `Throws` },
        { field: `stats.passes`, headerName: `Passes` },
        { field: `stats.catches`, headerName: `Catches` },
        { field: `stats.strips`, headerName: `Strips` },
        { field: `stats.touchdowns`, headerName: `TDs` },
        { field: `stats.touchdown_passes`, headerName: `TD Passes` },
        { field: `stats.passing_blocks`, headerName: `Pass (m)` },
        { field: `stats.receive_blocks`, headerName: `Catch (m)` },
        { field: `stats.defensive_interceptions`, headerName: `Def Int` },
        { field: `stats.pass_interceptions`, headerName: `Pass Int` },
      ],
      defaultColDef: { initialWidth: 80 },
      domLayout: `autoHeight`,
      onGridReady: (params) => params.api.autoSizeAllColumns(),
      rowData: props.players,
      suppressDragLeaveHidesColumns: true,
      theme: gridTheme,
    });

    setCurrentGrid(grid);

    return () => {
      setCurrentGrid(undefined);
      grid.destroy();
    };
  });

  const handleExportCsv = () => {
    const grid = currentGrid();
    if (!grid) return;

    void navigator.clipboard.writeText(grid.getDataAsCsv() ?? ``);
    toast.success(`CSV copied to clipboard`);
  };

  return (
    <section>
      <div class='mb-4 flex items-center gap-3'>
        <h2 class='text-xl font-bold'>Aggregate Player Stats</h2>
        <Button class='size-8' onClick={handleExportCsv} title='Export CSV'>
          <Csv />
        </Button>
      </div>
      <div class='!ag-grid' data-ag-theme-mode='dark-blue' ref={gridRef} />
    </section>
  );
};
