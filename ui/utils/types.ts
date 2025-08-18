export type Match = {
  data: MatchData;
  id: number;
};

export type MatchData = {
  duration: number;
  is_tourney: boolean;
  map: string;
  players: PlayerStats;
  server: string;
  start_time: number;
  team_one_name: string;
  team_one_score: number;
  team_two_name: string;
  team_two_score: number;
  winner: number;
};

export type Player = {
  stats: Stats;
  username: string;
  uuid: string;
};

export type PlayerStats = Player[];

export type RecentMatches = Match[];

export type Stats = {
  assists: number;
  catches: number;
  damage_carrier: number;
  damage_dealt: number;
  damage_taken: number;
  deaths: number;
  defensive_interceptions: number;
  kills: number;
  killstreak: number;
  pass_interceptions: number;
  passes: number;
  passing_blocks: number;
  pickups: number;
  receive_blocks: number;
  strips: number;
  team: number;
  throws: number;
  touchdown_passes: number;
  touchdowns: number;
};

export type Uber = Match & {
  players: PlayerStats;
};
