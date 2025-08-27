/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { A, useParams } from '@solidjs/router';
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
import {
  createResource,
  createSignal,
  onMount,
  Show,
  Suspense,
} from 'solid-js';
import { toast } from 'solid-sonner';

import { Button } from '@/components/button';
import { Csv } from '@/icons';
import {
  formatNumericalDuration,
  formatReallyLongTime,
  divHtml as html,
} from '@/utils';
import { gridTheme } from '@/utils/grid';
import { type PlayerData, type Uber } from '@/utils/types';
import { useTheme } from '@/utils/use-theme';

const getData = async (id: string | undefined): Promise<Uber | undefined> => {
  if (!id) return undefined;
  const apiRoot =
    import.meta.env.VITE_API_ROOT ?? `https://tombrady.fireballs.me/api/`;
  const res = await fetch(apiRoot + `matches/${id}/uber`);
  if (res.status !== 200) return undefined;
  return (await res.json()) as Uber;
};

const redColor = "text-red-600";
const blueColor = "text-blue-600";
const teamColorMap : {
   [key: string]: string,
} = {
  "9": "text-blue-600",
  "12": "text-red-600",
  "0": "text-black",
  "6": "text-orange-600"
}

const nameCellRenderer = (teamOneColor: string, teamTwoColor: string) => (params: { data: PlayerData; value: string }) => {
  const teamColor = params.data.stats.team - 1 === 0 ? teamOneColor : teamTwoColor;
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

const teamCellRenderer = (teamOneColor: string, teamTwoColor: string) => (params: ICellRendererParams<PlayerData>) =>  {
  const teamColor = params.data!.stats.team - 1 === 0 ? teamOneColor : teamTwoColor;
  return html`
    <div>
      <span class="${teamColor}">
        ${params.value}
      </span>
    </div>
  `;
}

const Stats = (props: { data: Uber }) => {
  const [currentGrid, setCurrentGrid] = createSignal<GridApi<PlayerData>>();
  let theGrid: HTMLDivElement;

  const teamNames = [
    // eslint-disable-next-line solid/reactivity
    props.data.data.team_one_name,
    // eslint-disable-next-line solid/reactivity
    props.data.data.team_two_name,
  ];
  const colorDataPresent = props.data.data.team_one_color != null && props.data.data.team_two_color != null;
  const teamOneColor = colorDataPresent && props.data.data.team_one_color.toString() in teamColorMap 
    ? teamColorMap[props.data.data.team_one_color.toString()] 
    : redColor;
  const teamTwoColor = colorDataPresent && props.data.data.team_two_color.toString() in teamColorMap 
    ? teamColorMap[props.data.data.team_two_color.toString()] 
    : blueColor;

  const theme = useTheme();

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
          cellRenderer: teamCellRenderer(teamOneColor, teamTwoColor),
          field: `stats.team`,
          filter: true,
          headerName: `Team`,
          sort: `desc`,
          valueGetter: (p) => teamNames[p.data!.stats.team - 1],
        },
        {
          cellRenderer: nameCellRenderer(teamOneColor, teamTwoColor),
          field: `username`,
          headerName: `Player`,
          pinned: `left`,
        },
        { field: `stats.kills`, headerName: `K`, sort: `desc` },
        { field: `stats.deaths`, headerName: `D` },
        { field: `stats.assists`, headerName: `A` },
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
      rowData: props.data.players,
      suppressDragLeaveHidesColumns: true,
      theme: gridTheme,
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
    <div class='container mx-auto flex min-h-screen flex-col space-y-4 p-2 xl:p-4'>
      <div>
        <A
          class='text-primary/70 transition-colors duration-200 hover:text-primary'
          href='/matches'
        >
          ← Recent Matches
        </A>
        <h1 class='text-2xl font-bold'>
          <span class='tracking-wide uppercase'>{props.data.data.map}</span>
          {` `}
          <span class='font-medium text-tertiary'>#{props.data.id}</span>
        </h1>
        <div>Started {formatReallyLongTime(props.data.data.start_time)}</div>
        <div>
          {formatNumericalDuration(props.data.data.duration)} - played on{` `}
          {props.data.data.server}
        </div>
        <div>
          <span class={teamOneColor}>{props.data.data.team_one_name}</span>
          {` `}
          {props.data.data.team_one_score} - {props.data.data.team_two_score}
          {` `}
          <span class={teamTwoColor}>{props.data.data.team_two_name}</span>
        </div>
      </div>
      <hr />
      <div class='flex-1'>
        <div
          class='ag-grid'
          data-ag-theme-mode={theme().replace(`dark`, `dark-blue`)}
          ref={theGrid!}
        />
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
    </div>
  );
};

const StatsPage = () => {
  const params = useParams();
  const [data] = createResource<Uber | undefined>(() => getData(params.id));

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
