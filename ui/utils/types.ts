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
  team_one_color: number;
  team_one_name: string;
  team_one_score: number;
  team_two_color: number;
  team_two_name: string;
  team_two_score: number;
  winner: number;
};

export type Matches = Match[];

export type MVPCategory =
  | `defensive`
  | `mvp`
  | `offensive`
  | `passer`
  | `pvp`
  | `receiver`;

export type Player = {
  username: string;
  uuid: string;
};

export type PlayerData = Player & {
  indexes: PlayerIndexScores;
  matchesPlayed: number;
  stats: Stats;
  timePlayed: number;
};

export type PlayerIndexScores = {
  defense: number;
  offense: number;
  passing: number;
  pvp: number;
  receiving: number;
  total: number;
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

export type TournamentData = {
  captains: Player[];
  date: number;
  matchCount: number;
  name: string;
  playerCount: number;
  winnerTeamId: number;
};

export type TournamentMatchData = {
  duration: number;
  matchId: number;
  server: string;
  startTime: number;
  teamOneId: number;
  teamOneScore: number;
  teamTwoId: number;
  teamTwoScore: number;
};

export type TournamentStatsData = {
  allTournament: Player[] & { length: 5 };
  date: number;
  matches: TournamentMatchData[];
  mvp: {
    dpot: Player;
    mvp: Player;
    oldl: Player;
    opot: Player;
    passer: Player;
    receiver: Player;
  };
  name: string;
  teams: TournamentTeam[];
  winnerTeamId: number;
};

export type TournamentTeam = {
  captain: Player;
  id: number;
  players: PlayerData[];
};

export type Uber = Match & {
  players: PlayerStats;
};
