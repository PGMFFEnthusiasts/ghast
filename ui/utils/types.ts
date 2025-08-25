export type Match = {
  data: MatchData;
  id: number;
  players: string[];
};

export type MatchData = {
  duration: number;
  is_tourney: boolean;
  map: string;
  server: string;
  start_time: number;
  team_one_name: string;
  team_one_score: number;
  team_two_name: string;
  team_two_score: number;
  winner: number;
};

export type Matches = Match[];

export type PaginatedMatches = { matches: Matches; total_matches: number };

export type Player = {
  username: string;
  uuid: string;
};

export type PlayerData = Player & {
  stats: Stats;
};

export type PlayerStats = PlayerData[];

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
