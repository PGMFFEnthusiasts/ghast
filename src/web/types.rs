use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::model::{match_data::PlayerlessMatchData, player_match_stats::PlayerMatchStats};

#[derive(Serialize, Deserialize)]
pub struct PlayerData {
    pub uuid: Uuid,
    pub username: String,
}

#[derive(Serialize, Deserialize)]
pub struct MatchResponse {
    pub id: u32,
    pub data: PlayerlessMatchData,
    pub players: Vec<PlayerData>,
}

#[derive(Serialize, Deserialize)]
pub struct PlayerlessMatchApi {
    pub id: u32,
    pub data: PlayerlessMatchData,
}

pub type MatchApi = Vec<MatchResponse>;

#[derive(Serialize, Deserialize)]
pub struct MatchPlayer {
    pub username: String,
    pub uuid: String,
    pub stats: PlayerMatchStats,
}

pub type MatchPlayerApi = Vec<MatchPlayer>;

#[derive(Serialize, Deserialize)]
pub struct UberApi {
    pub id: u32,
    pub data: PlayerlessMatchData,
    pub players: Vec<MatchPlayer>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TournamentPlayerInfo {
    pub uuid: String,
    pub username: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TournamentPlayerWithStats {
    pub uuid: String,
    pub username: String,
    pub stats: TournamentAggregateStats,
    pub matches_played: u32,
    pub time_played: u32,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TournamentAggregateStats {
    pub assists: u32,
    pub catches: u32,
    pub damage_carrier: f32,
    pub damage_dealt: f64,
    pub damage_taken: f64,
    pub deaths: u32,
    pub defensive_interceptions: u32,
    pub kills: u32,
    pub killstreak: u32,
    pub pass_interceptions: u32,
    pub passes: u32,
    pub passing_blocks: f32,
    pub pickups: u32,
    pub receive_blocks: f32,
    pub strips: u32,
    pub team: i32,
    pub throws: u32,
    pub touchdown_passes: u32,
    pub touchdowns: u32,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TournamentListResponse {
    pub id: u32,
    pub captains: Vec<TournamentPlayerInfo>,
    pub date: u64,
    pub match_count: u32,
    pub name: String,
    pub player_count: u32,
    pub winner_team_id: i32,
}

pub type TournamentListApi = Vec<TournamentListResponse>;

#[derive(Serialize, Deserialize)]
pub struct TournamentTeamResponse {
    pub captain: TournamentPlayerInfo,
    pub id: i32,
    pub players: Vec<TournamentPlayerWithStats>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TournamentMatchResponse {
    pub duration: u32,
    pub match_id: u32,
    pub server: String,
    pub start_time: u64,
    pub team_one_id: i32,
    pub team_one_score: u32,
    pub team_two_id: i32,
    pub team_two_score: u32,
}

#[derive(Serialize, Deserialize)]
pub struct TournamentMvpResponse {
    pub dpot: TournamentPlayerInfo,
    pub mvp: TournamentPlayerInfo,
    pub oldl: TournamentPlayerInfo,
    pub opot: TournamentPlayerInfo,
    pub passer: TournamentPlayerInfo,
    pub receiver: TournamentPlayerInfo,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TournamentDetailedResponse {
    pub all_tournament: Vec<TournamentPlayerInfo>,
    pub date: u64,
    pub matches: Vec<TournamentMatchResponse>,
    pub mvp: TournamentMvpResponse,
    pub name: String,
    pub teams: Vec<TournamentTeamResponse>,
    pub winner_team_id: i32,
}
