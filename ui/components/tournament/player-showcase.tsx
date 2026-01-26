import { Show } from 'solid-js';

import type { Player, PlayerData } from '@/utils/types';

import { HoverCard } from '@/components/hover-card';
import { MinecraftSkin } from '@/components/tournament/minecraft-skin';
import { PlayerLabel } from '@/components/tournament/player-label';
import {
  cycleStatMode,
  PlayerStatsHover,
} from '@/components/tournament/player-stats-hover';
import { Podium } from '@/components/tournament/podium';

export const PlayerShowcase = (props: {
  depth?: number;
  exportBlur?: boolean;
  glowColor: string;
  height: number;
  label: string;
  player: Player;
  playerData?: PlayerData;
  skinSrc?: string;
  yaw?: number;
}) => {
  const skin = (
    <MinecraftSkin
      height={props.height}
      src={props.skinSrc}
      uuid={props.skinSrc ? undefined : props.player.uuid}
      yaw={props.skinSrc ? undefined : props.yaw}
    />
  );

  return (
    <div class='relative isolate flex items-center justify-center'>
      <Show fallback={skin} when={props.playerData}>
        <HoverCard
          content={<PlayerStatsHover playerData={props.playerData!} />}
          glowColor={props.glowColor}
          onClick={cycleStatMode}
        >
          {skin}
        </HoverCard>
      </Show>
      <Podium
        color={props.glowColor}
        depth={props.depth}
        id={`${props.label.replaceAll(/\s+/g, `-`)}-${props.player.uuid}`}
      />
      <PlayerLabel
        exportBlur={props.exportBlur}
        glowColor={props.glowColor}
        label={props.label}
        username={props.player.username}
      />
    </div>
  );
};
