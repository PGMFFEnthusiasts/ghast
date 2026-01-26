import {
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  CsvExportModule,
  type GridApi,
  ModuleRegistry,
  TextFilterModule,
} from 'ag-grid-community';
import { createEffect, createMemo, createSignal, onMount } from 'solid-js';
import { toast } from 'solid-sonner';

import type { PlayerData, Stats, TournamentTeam } from '@/utils/types';

type NormalizationMode = `perMatch` | `perMinute` | `total`;

import { Button } from '@/components/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '@/components/select';
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
          `<svg class="size-4 text-yellow-400 ml-auto shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 20q-.425 0-.712-.288T5 19t.288-.712T6 18h12q.425 0 .713.288T19 19t-.288.713T18 20zm.7-3.5q-.725 0-1.287-.475t-.688-1.2l-1-6.35q-.05 0-.112.013T3.5 8.5q-.625 0-1.062-.437T2 7t.438-1.062T3.5 5.5t1.063.438T5 7q0 .175-.038.325t-.087.275L8 9l3.125-4.275q-.275-.2-.45-.525t-.175-.7q0-.625.438-1.063T12 2t1.063.438T13.5 3.5q0 .375-.175.7t-.45.525L16 9l3.125-1.4q-.05-.125-.088-.275T19 7q0-.625.438-1.063T20.5 5.5t1.063.438T22 7t-.437 1.063T20.5 8.5q-.05 0-.112-.012t-.113-.013l-1 6.35q-.125.725-.687 1.2T17.3 16.5zm0-2h10.6l.65-4.175l-1.15.5q-.65.275-1.325.1t-1.1-.75L12 6.9l-2.375 3.275q-.425.575-1.1.75t-1.325-.1l-1.15-.5zm5.3 0" fill="currentColor"/></svg>`
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

const EXCLUDED_STATS_KEYS = new Set<keyof Stats>([`killstreak`, `team`]);

const NORMALIZATION_OPTIONS: { label: string; value: NormalizationMode }[] = [
  { label: `Total`, value: `total` },
  { label: `Avg/Match`, value: `perMatch` },
  { label: `Avg/Min`, value: `perMinute` },
];

const normalizeStats = (stats: Stats, divisor: number): Stats =>
  Object.fromEntries(
    Object.entries(stats).map(([key, value]) =>
      EXCLUDED_STATS_KEYS.has(key as keyof Stats) || typeof value !== `number` ?
        [key, value]
      : [key, value / divisor],
    ),
  ) as Stats;

const normalizePlayer = (
  player: PlayerData,
  mode: NormalizationMode,
): PlayerData => {
  const divisor =
    mode === `perMatch` ? player.matchesPlayed
    : mode === `perMinute` ? player.timePlayed / 60
    : 1;
  return divisor === 0 || divisor === 1 ?
      player
    : { ...player, stats: normalizeStats(player.stats, divisor) };
};

export const AggregateStatsTable = (props: {
  players: PlayerData[];
  teams: TournamentTeam[];
  winnerTeamId?: number;
}) => {
  let gridRef: HTMLDivElement | undefined;
  const [currentGrid, setCurrentGrid] = createSignal<GridApi<PlayerData>>();
  const [normalizationMode, setNormalizationMode] =
    createSignal<NormalizationMode>(`total`);

  const normalizedPlayers = createMemo(() =>
    props.players.map((player) => normalizePlayer(player, normalizationMode())),
  );

  const numericValueFormatter = (v: { value: unknown }) =>
    typeof v.value === `number` ?
      normalizationMode() === `total` ?
        Number.isInteger(v.value) ?
          String(v.value)
        : v.value.toFixed(2)
      : v.value.toFixed(2)
    : `0`;

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
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.deaths`,
          headerName: `Deaths`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.assists`,
          headerName: `Assists`,
          valueFormatter: numericValueFormatter,
        },
        { field: `stats.killstreak`, headerName: `Streak` },
        {
          field: `stats.damage_dealt`,
          headerName: `DMG Out`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.damage_taken`,
          headerName: `DMG In`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.pickups`,
          headerName: `Pickups`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.throws`,
          headerName: `Throws`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.passes`,
          headerName: `Passes`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.catches`,
          headerName: `Catches`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.strips`,
          headerName: `Strips`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.touchdowns`,
          headerName: `TDs`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.touchdown_passes`,
          headerName: `TD Passes`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.passing_blocks`,
          headerName: `Pass (m)`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.receive_blocks`,
          headerName: `Catch (m)`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.defensive_interceptions`,
          headerName: `Def Int`,
          valueFormatter: numericValueFormatter,
        },
        {
          field: `stats.pass_interceptions`,
          headerName: `Pass Int`,
          valueFormatter: numericValueFormatter,
        },
      ],
      defaultColDef: { initialWidth: 80 },
      domLayout: `autoHeight`,
      onGridReady: (params) => params.api.autoSizeAllColumns(),
      rowData: normalizedPlayers(),
      suppressDragLeaveHidesColumns: true,
      theme: gridTheme,
    });

    setCurrentGrid(grid);

    return () => {
      setCurrentGrid(undefined);
      grid.destroy();
    };
  });

  createEffect(() => {
    const grid = currentGrid();
    const players = normalizedPlayers();
    if (grid) {
      grid.setGridOption(`rowData`, players);
    }
  });

  const handleExportCsv = () => {
    const grid = currentGrid();
    if (!grid) return;

    void navigator.clipboard.writeText(grid.getDataAsCsv() ?? ``);
    toast.success(`CSV copied to clipboard`);
  };

  return (
    <section>
      <div class='mb-4 flex flex-wrap items-center gap-3'>
        <h2 class='flex items-center gap-1.5 text-xl font-bold'>
          <Select
            defaultValue={NORMALIZATION_OPTIONS[0]}
            disallowEmptySelection
            gutter={6}
            itemComponent={(itemProps) => (
              <SelectItem item={itemProps.item}>
                {itemProps.item.rawValue.label}
              </SelectItem>
            )}
            onChange={(option) => option && setNormalizationMode(option.value)}
            options={NORMALIZATION_OPTIONS}
            optionTextValue='label'
            optionValue='value'
            placement='top-start'
          >
            <SelectTrigger
              class='text-xl font-bold hover:cursor-pointer'
              hideIcon
            >
              <SelectValue<(typeof NORMALIZATION_OPTIONS)[0]>>
                {(state) => state.selectedOption().label}
              </SelectValue>
            </SelectTrigger>
            <SelectPortal>
              <SelectContent />
            </SelectPortal>
          </Select>
          Player Stats
        </h2>
        <Button
          class='ml-auto size-8'
          onClick={handleExportCsv}
          title='Export CSV'
        >
          <Csv />
        </Button>
      </div>
      <div class='ag-grid!' data-ag-theme-mode='dark-blue' ref={gridRef} />
    </section>
  );
};
