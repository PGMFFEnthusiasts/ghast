import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { PlayerFace } from '@/src/components/player-face';

type MapInfo = {
  image: string;
  length: number;
  width: number;
};

export const maps = {
  brady_block: {
    image: `/brady_block.webp`,
    length: 111,
    width: 49,
  },
  cancun: {
    image: `/cancun.webp`,
    length: 111,
    width: 49,
  },
  'exp-12': {
    image: `/exp-12.webp`,
    length: 111,
    width: 65,
  },
  fbbowl: {
    image: `/fbbowl.webp`,
    length: 135,
    width: 79,
  },
  tron: {
    image: `/tron.webp`,
    length: 111,
    width: 57,
  },
} as const satisfies Record<string, MapInfo>;

export type DeathEvent = {
  killer?: string;
  player: string;
  timestamp: number;
  type: `death`;
};

export type LocatedEvent = MapEvent & { x: number; y: number };

export type MapEvent = DeathEvent | ScoreEvent;

export type MapEvents = LocatedEvent[];

export type MapId = keyof typeof maps;

export type ScoreEvent = {
  player: string;
  points: number;
  timestamp: number;
  type: `score`;
};

type PlayerInfo = {
  name: string;
  uuid: string;
};

const playerCache = new globalThis.Map<string, PlayerInfo>();
const pendingFetches = new globalThis.Map<string, Promise<PlayerInfo>>();

const fetchPlayer = async (uuid: string): Promise<PlayerInfo> => {
  const cached = playerCache.get(uuid);
  if (cached) return cached;

  const pending = pendingFetches.get(uuid);
  if (pending) return pending;

  const promise = fetch(
    `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`,
  )
    .then((res) => (res.ok ? res.json() : undefined))
    .then((data: undefined | { id: string; name: string }) => {
      const info: PlayerInfo = { name: data?.name ?? uuid, uuid };
      playerCache.set(uuid, info);
      pendingFetches.delete(uuid);
      return info;
    });

  pendingFetches.set(uuid, promise);
  return promise;
};

const usePlayerNames = (uuids: string[]) => {
  const [names, setNames] = useState<Record<string, string>>({});
  const fetchedRef = useRef(new Set<string>());

  useEffect(() => {
    const uncached = uuids.filter((uuid) => !fetchedRef.current.has(uuid));
    if (uncached.length === 0) return;

    uncached.forEach((uuid) => fetchedRef.current.add(uuid));

    void Promise.all(uncached.map((uuid) => fetchPlayer(uuid))).then(
      (results) => {
        setNames((prev) => {
          const next = { ...prev };
          results.forEach((info) => {
            next[info.uuid] = info.name;
          });
          return next;
        });
      },
    );
  }, [uuids]);

  return (uuid: string) => names[uuid] ?? playerCache.get(uuid)?.name ?? uuid;
};

const PlayerTag = ({
  getName,
  uuid,
}: {
  getName: (_uuid: string) => string;
  uuid: string;
}) => (
  <div className='inline-flex items-center gap-1'>
    <PlayerFace alt={getName(uuid)} className='size-4' uuid={uuid} />
    <span>{getName(uuid)}</span>
  </div>
);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, `0`)}`;
};

const EventRow = ({
  event,
  getName,
}: {
  event: MapEvent;
  getName: (_uuid: string) => string;
}) => {
  switch (event.type) {
    case `death`: {
      return (
        <div className='flex items-center gap-1'>
          <PlayerTag getName={getName} uuid={event.player} />
          <span className='text-muted-foreground'>was killed by</span>
          {event.killer && <PlayerTag getName={getName} uuid={event.killer} />}
          <span className='text-muted-foreground'>
            at {formatTime(event.timestamp)}
          </span>
        </div>
      );
    }
    case `score`: {
      return (
        <div className='flex items-center gap-1'>
          <PlayerTag getName={getName} uuid={event.player} />
          <span className='text-muted-foreground'>
            scored at {formatTime(event.timestamp)}
          </span>
        </div>
      );
    }
  }
};

type EventGroup = { events: LocatedEvent[]; x: number; y: number };

const useEventIndex = (allEvents: MapEvents) =>
  useMemo(() => {
    const map = new globalThis.Map<number, EventGroup>();
    const uuids = new Set<string>();

    allEvents.forEach((event) => {
      const key = event.x * 10_000 + event.y;
      const existing = map.get(key);
      if (existing) {
        existing.events.push(event);
      } else {
        map.set(key, { events: [event], x: event.x, y: event.y });
      }

      uuids.add(event.player);
      if (event.type === `death` && event.killer) {
        uuids.add(event.killer);
      }
    });

    return {
      groups: [...map.values()],
      lookup: (x: number, y: number) => map.get(x * 10_000 + y)?.events ?? [],
      uuids: [...uuids],
    };
  }, [allEvents]);

const blockStyle = (x: number, y: number, mapInfo: MapInfo): CSSProperties => ({
  height: `${(1 / mapInfo.width) * 100}%`,
  left: `${(x / mapInfo.length) * 100}%`,
  top: `${(y / mapInfo.width) * 100}%`,
  width: `${(1 / mapInfo.length) * 100}%`,
});

const MapMarkers = ({
  groups,
  mapInfo,
}: {
  groups: EventGroup[];
  mapInfo: MapInfo;
}) =>
  groups.map((group) => (
    <div
      className='pointer-events-none absolute border border-red-500 bg-red-500/35'
      key={`${group.x},${group.y}`}
      style={blockStyle(group.x, group.y, mapInfo)}
    />
  ));

export const Map = ({ events, map }: { events: MapEvents; map: MapId }) => {
  const [hoveredBlock, setHoveredBlock] = useState<
    undefined | { x: number; y: number }
  >();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInfo = maps[map];

  const { groups, lookup, uuids } = useEventIndex(events);
  const getName = usePlayerNames(uuids);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const relY = e.clientY - rect.top;

      const blockX = Math.floor((relX / rect.width) * mapInfo.length);
      const blockY = Math.floor((relY / rect.height) * mapInfo.width);

      if (
        blockX >= 0 &&
        blockX < mapInfo.length &&
        blockY >= 0 &&
        blockY < mapInfo.width
      ) {
        setHoveredBlock((prev) =>
          prev?.x === blockX && prev?.y === blockY ?
            prev
          : { x: blockX, y: blockY },
        );
      }
    },
    [mapInfo],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredBlock(undefined);
  }, []);

  const blockEvents =
    hoveredBlock ? lookup(hoveredBlock.x, hoveredBlock.y) : [];
  const tooltipAbove = !hoveredBlock || hoveredBlock.y > mapInfo.width * 0.1;

  return (
    <div className='relative inline-block select-none'>
      <img
        alt={`Map: ${map}`}
        className='block w-full [image-rendering:pixelated]'
        draggable={false}
        src={`/maps${mapInfo.image}`}
      />
      <div
        className='absolute inset-0'
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        ref={containerRef}
      >
        <MapMarkers groups={groups} mapInfo={mapInfo} />
        {hoveredBlock && (
          <>
            <div
              className='pointer-events-none absolute border border-white/80 bg-white/10'
              style={blockStyle(hoveredBlock.x, hoveredBlock.y, mapInfo)}
            />
            {blockEvents.length > 0 && (
              <div
                className='pointer-events-none absolute z-10 flex flex-col gap-1 rounded bg-black/90 px-2.5 py-2 text-xs whitespace-nowrap text-white backdrop-blur-sm'
                style={{
                  left: `${((hoveredBlock.x + 0.5) / mapInfo.length) * 100}%`,
                  top:
                    tooltipAbove ?
                      `${(hoveredBlock.y / mapInfo.width) * 100}%`
                    : `${((hoveredBlock.y + 1) / mapInfo.width) * 100}%`,
                  transform:
                    tooltipAbove ?
                      `translate(-50%, calc(-100% - 4px))`
                    : `translate(-50%, 4px)`,
                }}
              >
                <div className='text-muted-foreground'>
                  ({hoveredBlock.x}, {hoveredBlock.y}) — {blockEvents.length}
                  {` `}
                  {blockEvents.length === 1 ? `event` : `events`}
                </div>
                {blockEvents.map((event, i) => (
                  <EventRow event={event} getName={getName} key={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
