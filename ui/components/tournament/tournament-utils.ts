import { fetchSkinAsDataUrl } from '@/components/tournament/minecraft-skin';

export const getColumnCount = () =>
  window.innerWidth >= 1024 ? 3
  : window.innerWidth >= 640 ? 2
  : 1;

export const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

export const createResizeHandler = (setColumns: (_: number) => void) => () =>
  void setColumns(getColumnCount());

export type MvpSkins = {
  dpot: string;
  mvp: string;
  oldl: string;
  opot: string;
  passer: string;
  receiver: string;
};

export const loadMvpSkins = async (mvp: {
  dpot: { uuid: string };
  mvp: { uuid: string };
  oldl: { uuid: string };
  opot: { uuid: string };
  passer: { uuid: string };
  receiver: { uuid: string };
}): Promise<MvpSkins> => {
  const [opot, mvpSkin, dpot, passer, oldl, receiver] = await Promise.all([
    fetchSkinAsDataUrl(mvp.opot.uuid, 20),
    fetchSkinAsDataUrl(mvp.mvp.uuid, 0),
    fetchSkinAsDataUrl(mvp.dpot.uuid, -20),
    fetchSkinAsDataUrl(mvp.passer.uuid, 20),
    fetchSkinAsDataUrl(mvp.oldl.uuid, 0),
    fetchSkinAsDataUrl(mvp.receiver.uuid, -20),
  ]);
  return { dpot, mvp: mvpSkin, oldl, opot, passer, receiver };
};

export const loadAllTournamentSkins = async (
  players: { uuid: string }[],
): Promise<string[]> =>
  Promise.all(
    players.map((p, i) =>
      fetchSkinAsDataUrl(p.uuid, getAllTournamentYaw(i, 3)),
    ),
  );

export const getAllTournamentYaw = (index: number, columns: number) =>
  columns === 3 ? [20, 0, -20, 20, -20][index]
  : columns === 2 ? [20, -20, 20, -20, 0][index]
  : [0, -20, 20, -20, 0][index];
