import { query } from '@solidjs/router';

import type {
  Matches,
  TournamentDetailedData,
  TournamentListItem,
  Uber,
} from '@/utils/types';

const API_ROOT: string =
  (import.meta.env.VITE_API_ROOT as string | undefined) ??
  `https://tombrady.fireballs.me/api/`;

export const getMatches = query(async () => {
  const res = await fetch(new URL(`matches/all`, API_ROOT));
  return res.status === 200 ? ((await res.json()) as Matches) : [];
}, `matches`);

export const getMatchUber = query(async (id: string) => {
  const res = await fetch(new URL(`matches/${id}/uber`, API_ROOT));
  return res.status === 200 ? ((await res.json()) as Uber) : undefined;
}, `match-uber`);

export const getTournaments = query(async () => {
  const res = await fetch(new URL(`tournaments/all`, API_ROOT));
  return res.status === 200 ? ((await res.json()) as TournamentListItem[]) : [];
}, `tournaments`);

export const getTournamentDetail = query(async (id: string) => {
  const res = await fetch(new URL(`tournaments/${id}`, API_ROOT));
  return res.status === 200 ?
      ((await res.json()) as TournamentDetailedData)
    : undefined;
}, `tournament-detail`);
