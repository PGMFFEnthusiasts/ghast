use rocket::serde::Serialize;
use serde::Deserialize;

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayerMatchStats {
    pub team: i32,
    pub kills: u32,
    pub deaths: u32,
    pub assists: u32,
    pub killstreak: u32,
    pub damage_dealt: f64,
    pub damage_taken: f64,
    pub pickups: u32,
    pub throws: u32,
    pub passes: u32,
    pub catches: u32,
    pub strips: u32,
    pub touchdowns: u32,
    pub touchdown_passes: u32,
    pub passing_blocks: f32,
    pub receive_blocks: f32,
    pub defensive_interceptions: u32,
    pub pass_interceptions: u32,
    pub damage_carrier: f32,
}
