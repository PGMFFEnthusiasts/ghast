/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { createAsync, type RouteDefinition, useParams } from '@solidjs/router';
import {
  type CellKeyDownEvent,
  ClientSideRowModelModule,
  ColumnAutoSizeModule,
  createGrid,
  CsvExportModule,
  EventApiModule,
  type GridApi,
  HighlightChangesModule,
  type ICellRendererParams,
  ModuleRegistry,
  TextFilterModule,
} from 'ag-grid-community';
import { createSignal, onMount, Show, Suspense } from 'solid-js';
import { toast } from 'solid-sonner';

import { Button } from '@/components/button';
import { Layout } from '@/components/layouts/the-layout';
import { Csv } from '@/icons';
import {
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils';
import { getMatchUber } from '@/utils/api';
import { getGridTheme } from '@/utils/grid';
import { type PlayerData, type Uber } from '@/utils/types';

export const route = {
  preload: ({ params }) => getMatchUber(params.id),
} satisfies RouteDefinition;

const redColor = `text-red-600`;
const blueColor = `text-blue-600`;
const teamColorMap: {
  [key: string]: string;
} = {
  '0': `text-black`,
  '12': `text-red-600`,
  '6': `text-orange-600`,
  '9': `text-blue-600`,
};

const colorCorrect = (
  teamName: string,
  teamColor: number | undefined,
  teamOrdinal: number,
) => {
  if (typeof teamColor === `number`) {
    const resolvedColor = teamColorMap[teamColor.toString()];
    if (resolvedColor) return resolvedColor;
  }

  if (teamName.toLowerCase() === `red`) return redColor;
  if (teamName.toLowerCase() === `blue`) return blueColor;

  return teamOrdinal === 0 ? redColor : blueColor;
};

const nameCellRenderer =
  (teamOneColor: string, teamTwoColor: string) =>
  (params: { data: PlayerData; value: string }) => {
    const teamColor =
      params.data.stats.team - 1 === 0 ? teamOneColor : teamTwoColor;
    return html`
      <span class="${teamColor} flex items-center gap-2 font-medium">
        <img
          alt="${params.data.username}'s Head"
          title="${params.data.username}'s Head"
          class="aspect-square size-6"
          src="${`https://nmsr.nickac.dev/face/${params.data.uuid}?width=64`}"
        />${params.value}
      </span>
    `;
  };

const teamCellRenderer =
  (teamOneColor: string, teamTwoColor: string) =>
  (params: ICellRendererParams<PlayerData>) => {
    const teamColor =
      params.data!.stats.team - 1 === 0 ? teamOneColor : teamTwoColor;
    return html`
      <div>
        <span class="${teamColor}"> ${params.value} </span>
      </div>
    `;
  };

const Stats = (props: { data: Uber }) => {
  const [currentGrid, setCurrentGrid] = createSignal<GridApi<PlayerData>>();
  let theGrid: HTMLDivElement;

  const teamNames = () => [
    props.data.data.team_one_name,
    props.data.data.team_two_name,
  ];
  const teamOneColor = () =>
    colorCorrect(
      props.data.data.team_one_name,
      props.data.data.team_one_color,
      0,
    );
  const teamTwoColor = () =>
    colorCorrect(
      props.data.data.team_two_name,
      props.data.data.team_two_color,
      1,
    );

  onMount(() => {
    ModuleRegistry.registerModules([
      ColumnAutoSizeModule,
      HighlightChangesModule,
      TextFilterModule,
      CsvExportModule,
      EventApiModule,
      ClientSideRowModelModule,
    ]);
    const grid = createGrid(theGrid!, {
      autoSizeStrategy: {
        type: `fitCellContents`,
      },
      columnDefs: [
        {
          cellRenderer: teamCellRenderer(teamOneColor(), teamTwoColor()),
          field: `stats.team`,
          filter: true,
          headerName: `Team`,
          sort:
            localStorage.getItem(`ihatekunet`) === undefined ?
              `desc`
            : undefined,
          valueGetter: (p) => teamNames()[p.data!.stats.team - 1],
        },
        {
          cellRenderer: nameCellRenderer(teamOneColor(), teamTwoColor()),
          field: `username`,
          headerName: `Player`,
          pinned: `left`,
        },
        { field: `stats.kills`, headerName: `Kills`, sort: `desc` },
        { field: `stats.deaths`, headerName: `Deaths` },
        { field: `stats.assists`, headerName: `Assists` },
        { field: `stats.killstreak`, headerName: `Streak` },
        {
          field: `stats.damage_dealt`,
          headerName: `DMG Out`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          valueFormatter: (v) => v.value.toFixed(2),
        },
        {
          field: `stats.damage_taken`,
          headerName: `DMG In`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          valueFormatter: (v) => v.value.toFixed(2),
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
        {
          field: `stats.defensive_interceptions`,
          headerName: `Def Int`,
        },
        {
          field: `stats.pass_interceptions`,
          headerName: `Pass Int`,
        },
        {
          field: `stats.damage_carrier`,
          headerName: `DMG Carrier`,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          valueFormatter: (v) => v.value.toFixed(2),
        },
        {
          field: `uuid`,
          headerName: `UUID`,
        },
      ],
      defaultColDef: {
        initialWidth: 80,
      },
      domLayout: `autoHeight`,
      onGridReady: (params) => {
        params.api.autoSizeAllColumns();
      },
      rowData: props.data.players,
      suppressDragLeaveHidesColumns: true,
      theme: getGridTheme(),
    });

    grid.addEventListener(`cellKeyDown`, (e) => {
      const keyboardEvent = e.event as KeyboardEvent;
      if (
        !(keyboardEvent.ctrlKey || keyboardEvent.metaKey) ||
        keyboardEvent.key.toLowerCase() !== `c`
      )
        return;
      const ev = e as CellKeyDownEvent;
      toast(`Copied "${ev.value}" to clipboard`);

      e.api.flashCells({
        columns: [ev.column],
        rowNodes: [e.node],
      });

      void navigator.clipboard.writeText(ev.value ?? ``);
    });

    setCurrentGrid(grid);

    return () => {
      setCurrentGrid(undefined);
      grid.destroy();
    };
  });

  return (
    <Layout
      description={
        <>
          <div>Started {formatReallyLongTime(props.data.data.start_time)}</div>
          <div>
            {formatNumericalDuration(props.data.data.duration)} - played on{` `}
            {props.data.data.server}
          </div>
          <div>
            <span class={teamOneColor()}>{props.data.data.team_one_name}</span>
            {` `}
            {props.data.data.team_one_score} - {props.data.data.team_two_score}
            {` `}
            <span class={teamTwoColor()}>{props.data.data.team_two_name}</span>
          </div>
        </>
      }
      fillViewport
      title={
        <>
          <span class='tracking-wide uppercase'>{props.data.data.map}</span>
          {` `}
          <span class='font-medium text-tertiary'>#{props.data.id}</span>
        </>
      }
    >
      <hr />
      <div class='flex-1'>
        <div class='ag-grid!' data-ag-theme-mode='dark-blue' ref={theGrid!} />
      </div>

      <hr />
      <Button
        class='size-8'
        onClick={() => {
          const grid = currentGrid();
          if (!grid) return;

          void navigator.clipboard.writeText(grid.getDataAsCsv() ?? ``);
          toast.success(`CSV copied to the clipboard`);
        }}
      >
        <Csv />
      </Button>
    </Layout>
  );
};

const StatsPage = () => {
  const params = useParams();
  const data = createAsync(() => getMatchUber(params.id));

  return (
    <>
      <Suspense>
        <Show when={!data()}>
          <div>not found / invalid data</div>
        </Show>
        <Show when={data()}>
          <Stats data={data()!} />
        </Show>
      </Suspense>
    </>
  );
};

export default StatsPage;
