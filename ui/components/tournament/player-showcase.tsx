import type { Player } from '@/utils/types';

import { MinecraftSkin } from '@/components/tournament/minecraft-skin';
import { PlayerLabel } from '@/components/tournament/player-label';
import { Podium } from '@/components/tournament/podium';

export const PlayerShowcase = (props: {
  depth?: number;
  exportBlur?: boolean;
  glowColor: string;
  height: number;
  label: string;
  player: Player;
  skinSrc?: string;
  yaw?: number;
}) => (
  <div class='relative isolate flex items-center justify-center'>
    <MinecraftSkin
      height={props.height}
      src={props.skinSrc}
      uuid={props.skinSrc ? undefined : props.player.uuid}
      yaw={props.skinSrc ? undefined : props.yaw}
    />
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
