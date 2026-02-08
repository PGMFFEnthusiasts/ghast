export const INDEX_COLORS = {
  defense: `#22C55E`,
  mvp: `#FFDD00`,
  offense: `#A855F7`,
  passing: `#3B82F6`,
  pvp: `#EF4444`,
  receiving: `#F97316`,
} as const;

export const getColumnCount = () =>
  window.innerWidth >= 1024 ? 3
  : window.innerWidth >= 640 ? 2
  : 1;

export const createResizeHandler = (setColumns: (_: number) => void) => () =>
  void setColumns(getColumnCount());

export const getAllTournamentYaw = (index: number, columns: number) =>
  columns === 3 ? [20, 0, -20, 20, -20][index]
  : columns === 2 ? [20, -20, 20, -20, 0][index]
  : [0, -20, 20, -20, 0][index];
