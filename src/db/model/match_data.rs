use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MatchData {
    pub server: String,
    pub start_time: u64,
    pub duration: u32,
    pub winner: i32,
    pub team_one_score: u32,
    pub team_two_score: u32,
    pub map: String,
    pub is_tourney: bool,
    pub team_one_name: String,
    pub team_two_name: String,
    pub team_one_color: Option<u32>,
    pub team_two_color: Option<u32>
}
