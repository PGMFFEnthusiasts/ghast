use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::db::model::{match_data::PlayerlessMatchData, player_match_stats::PlayerMatchStats};

#[derive(Serialize, Deserialize, Clone)]
pub struct PlayerData {
    pub uuid: Uuid,
    pub username: String,
}

#[derive(Serialize, Deserialize, Clone)]
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
pub struct PaginatedMatchApi {
    pub matches: MatchApi,
    pub total_matches: i64,
}

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
