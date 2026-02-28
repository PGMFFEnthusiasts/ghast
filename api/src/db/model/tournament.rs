use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentBase {
    pub id: u32,
    pub name: String,
    pub date: u64,
    pub winner_team_id: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentWithCounts {
    pub id: u32,
    pub name: String,
    pub date: u64,
    pub winner_team_id: i32,
    pub match_count: u32,
    pub player_count: u32,
    pub captain_uuids: Vec<Uuid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentTeam {
    pub tournament_id: u32,
    pub team_id: i32,
    pub captain_uuid: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentTeamPlayer {
    pub tournament_id: u32,
    pub team_id: i32,
    pub player_uuid: Uuid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TournamentMatchMapping {
    pub tournament_id: u32,
    pub match_id: u32,
    pub team_one_tournament_id: i32,
    pub team_two_tournament_id: i32,
    pub duration: u32,
    pub server: String,
    pub start_time: u64,
    pub team_one_score: u32,
    pub team_two_score: u32,
}
