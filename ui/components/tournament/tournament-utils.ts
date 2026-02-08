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
