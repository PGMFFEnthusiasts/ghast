import { createSignal, For } from 'solid-js';

import type { PlayerData, Stats } from '@/utils/types';

export type StatMode = `perMatch` | `perMinute` | `total`;

const STAT_MODES: { label: string; value: StatMode }[] = [
  { label: `Total`, value: `total` },
  { label: `Per Match`, value: `perMatch` },
  { label: `Per Minute`, value: `perMinute` },
];

const [globalStatMode, setGlobalStatMode] = createSignal<StatMode>(`total`);

export const cycleStatMode = () => {
  const currentIndex = STAT_MODES.findIndex(
    (m) => m.value === globalStatMode(),
  );
  const nextIndex = (currentIndex + 1) % STAT_MODES.length;
  setGlobalStatMode(STAT_MODES[nextIndex].value);
};

const formatStat = (value: number, isDecimal: boolean): string =>
  isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();

const normalizeStat = (
  value: number,
  mode: StatMode,
  matchesPlayed: number,
  timePlayed: number,
): number => {
  if (mode === `total`) return value;
  if (mode === `perMatch`) return matchesPlayed > 0 ? value / matchesPlayed : 0;
  return timePlayed > 0 ? value / (timePlayed / 60) : 0;
};

const StatRow = (props: {
  isDecimal?: boolean;
  label: string;
  matchesPlayed: number;
  mode: StatMode;
  timePlayed: number;
  value: number;
}) => {
  const normalized = () =>
    normalizeStat(
      props.value,
      props.mode,
      props.matchesPlayed,
      props.timePlayed,
    );

  return (
    <div class='flex justify-between gap-4'>
      <span class='text-white/60'>{props.label}</span>
      <span class='font-medium'>
        {formatStat(normalized(), props.mode !== `total` || !!props.isDecimal)}
      </span>
    </div>
  );
};

const IndexRow = (props: { color: string; label: string; value: number }) => (
  <div class='flex items-center justify-between gap-4'>
    <span class='flex items-center gap-2'>
      <span class='size-2 rounded-full' style={{ background: props.color }} />
      <span class='text-white/60'>{props.label}</span>
    </span>
    <span class='font-medium'>{props.value.toFixed(1)}</span>
  </div>
);

export const PlayerStatsHover = (props: { playerData: PlayerData }) => {
  const mode = globalStatMode;
  const indexes = () => props.playerData.indexes;
  const stats = () => props.playerData.stats;
  const modeLabel = () => STAT_MODES.find((m) => m.value === mode())?.label;

  const indexColors = {
    defensive: `#22C55E`,
    mvp: `#FFDD00`,
    offensive: `#A855F7`,
    passer: `#3B82F6`,
    pvp: `#EF4444`,
    receiver: `#F97316`,
  };

  const statRows: { isDecimal?: boolean; key: keyof Stats; label: string }[] = [
    { key: `kills`, label: `Kills` },
    { key: `deaths`, label: `Deaths` },
    { key: `assists`, label: `Assists` },
    { key: `killstreak`, label: `Streak` },
    { isDecimal: true, key: `damage_dealt`, label: `DMG Out` },
    { isDecimal: true, key: `damage_taken`, label: `DMG In` },
    { key: `pickups`, label: `Pickups` },
    { key: `throws`, label: `Throws` },
    { key: `passes`, label: `Passes` },
    { key: `catches`, label: `Catches` },
    { key: `strips`, label: `Strips` },
    { key: `touchdowns`, label: `Touchdowns` },
    { key: `touchdown_passes`, label: `TD Passes` },
    { key: `passing_blocks`, label: `Pass (m)` },
    { key: `receive_blocks`, label: `Catch (m)` },
    { key: `defensive_interceptions`, label: `Def Int` },
    { key: `pass_interceptions`, label: `Pass Int` },
  ];

  return (
    <div class='relative flex min-w-[280px] flex-col gap-3 text-sm'>
      <div class='absolute top-0 right-0 flex flex-col items-end'>
        <span class='rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/70'>
          {modeLabel()}
        </span>
        <span class='mt-0.5 text-[10px] text-white/25'>click to cycle</span>
      </div>
      <div class='flex items-center gap-2 border-b border-white/10 pb-2'>
        <img
          class='size-8 rounded'
          src={`https://nmsr.nickac.dev/face/${props.playerData.uuid}`}
        />
        <div>
          <div class='font-bold'>{props.playerData.username}</div>
          <div class='text-xs text-white/50'>
            {props.playerData.matchesPlayed} matches •{` `}
            {Math.floor(props.playerData.timePlayed / 60)}m played
          </div>
        </div>
      </div>

      <div class='grid grid-cols-2 gap-x-6 gap-y-1'>
        <For each={statRows}>
          {(row) => (
            <StatRow
              isDecimal={row.isDecimal}
              label={row.label}
              matchesPlayed={props.playerData.matchesPlayed}
              mode={mode()}
              timePlayed={props.playerData.timePlayed}
              value={stats()[row.key]}
            />
          )}
        </For>
      </div>

      <div class='border-t border-white/10 pt-2'>
        <div class='mb-1 text-xs font-semibold text-white/40 uppercase'>
          MVP Indexes
        </div>
        <div class='flex flex-col gap-1'>
          <IndexRow
            color={indexColors.mvp}
            label='General'
            value={indexes().total}
          />
          <IndexRow
            color={indexColors.offensive}
            label='Offensive'
            value={indexes().offense}
          />
          <IndexRow
            color={indexColors.defensive}
            label='Defensive'
            value={indexes().defense}
          />
          <IndexRow color={indexColors.pvp} label='PvP' value={indexes().pvp} />
          <IndexRow
            color={indexColors.passer}
            label='Passing'
            value={indexes().passing}
          />
          <IndexRow
            color={indexColors.receiver}
            label='Receiving'
            value={indexes().receiving}
          />
        </div>
      </div>
    </div>
  );
};
