use crate::db::model::match_data::MatchData;
use crate::db::model::player_match_stats::PlayerFootballStats;
use chrono::{DateTime, NaiveDateTime, Utc};
use log::warn;
use sqlx::{Error, Pool, Sqlite, SqlitePool};
use std::collections::HashMap;
use std::str::from_utf8;
use uuid::{uuid, Uuid};

pub struct Database {
    connection_pool: Pool<Sqlite>
}

impl Database {
    pub async fn new(database_path: &str) -> Self {
        let pool = SqlitePool::connect(
            format!("sqlite:{}", database_path).as_str()
        ).await.unwrap();
        Database { connection_pool: pool }
    }

    pub async fn get_match_by_id(
        &self, id: u32
    ) -> Option<MatchData> {
        let result = sqlx::query!(r#"
SELECT match, server, start_time, duration, winner, team_one_score, team_two_score, map, is_tourney,
team_one_name, team_two_name FROM match_data WHERE match = ?1
        "#, id)
            .fetch_all(&self.connection_pool).await;
        match result {
            Ok(mut records) => {
                if records.is_empty() {
                    return None
                }
                let record = records.remove(0);
                Some(MatchData {
                    server: record.server,
                    start_time: record.start_time as u64,
                    duration: record.duration as u32,
                    winner: record.winner as i32,
                    team_one_score: record.team_one_score as u32,
                    team_two_score: record.team_two_score as u32,
                    map: record.map,
                    is_tourney: record.is_tourney == 1i64,
                    team_one_name: record.team_one_name.unwrap_or(String::from("Unknown")),
                    team_two_name: record.team_two_name.unwrap_or(String::from("Unknown"))
                })
            }
            Err(e) => {
                warn!("Error retrieving matches {:?}", e);
                None
            }
        }
    }

    pub async fn get_matches_timespan(
        &self, start_time: DateTime<Utc>, end_time: DateTime<Utc>
    ) -> Option<HashMap<u32, MatchData>> {
        let start_time_millis = start_time.timestamp_millis();
        let end_time_millis = end_time.timestamp_millis();
        let result = sqlx::query!(r#"
SELECT match, server, start_time, duration, winner, team_one_score, team_two_score, map,
is_tourney, team_one_name, team_two_name FROM match_data WHERE start_time >= ?1 AND start_time <= ?2
        "#, start_time_millis, end_time_millis)
            .fetch_all(&self.connection_pool).await;
        let mut match_data : HashMap<u32, MatchData> = HashMap::new();
        match result {
            Ok(records) => {
                if records.is_empty() {
                    return None
                }
                for record in records {
                    let datum = MatchData {
                        server: record.server,
                        start_time: record.start_time as u64,
                        duration: record.duration as u32,
                        winner: record.winner as i32,
                        team_one_score: record.team_one_score as u32,
                        team_two_score: record.team_two_score as u32,
                        map: record.map,
                        is_tourney: record.is_tourney == 1i64,
                        team_one_name: record.team_one_name.unwrap_or(String::from("Unknown")),
                        team_two_name: record.team_two_name.unwrap_or(String::from("Unknown"))
                    };
                    match_data.insert(record.r#match as u32, datum);
                }
                Some(match_data)
            }
            Err(e) => {
                warn!("Error retrieving matches {:?}", e);
                None
            }
        }
    }

    pub async fn get_player_match_stats(&self, match_id: u32) -> Option<HashMap<Uuid, PlayerFootballStats>> {
        let result = sqlx::query!(
            r#"
SELECT player, team, kills, deaths, assists, killstreak, dmg_dealt, dmg_taken, pickups,
throws, passes, catches, strips, touchdowns, touchdown_passes, passing_blocks, receive_blocks,
defensive_interceptions, pass_interceptions, damage_carrier
FROM player_match_data WHERE match = ?1"#, match_id
        ).fetch_all(&self.connection_pool).await;
        let mut player_stats : HashMap<Uuid, PlayerFootballStats> = HashMap::new();
        match result {
            Ok(rows) => {
                if rows.is_empty() {
                    return None
                }
                for record in &rows {
                    let id = {
                        let uuid_blob = record.player.clone();
                        let s = from_utf8(&uuid_blob[..]).unwrap();
                        Uuid::parse_str(s).unwrap()
                    };
                    let stats = PlayerFootballStats {
                        team: record.team as i32,
                        kills: record.kills as u32,
                        deaths: record.deaths as u32,
                        assists: record.assists as u32,
                        killstreak: record.killstreak as u32,
                        damage_dealt: record.dmg_dealt,
                        damage_taken: record.dmg_taken,
                        pickups: record.pickups as u32,
                        throws: record.throws as u32,
                        passes: record.passes as u32,
                        catches: record.catches as u32,
                        strips: record.strips as u32,
                        touchdowns: record.touchdowns as u32,
                        touchdown_passes: record.touchdown_passes as u32,
                        passing_blocks: record.passing_blocks.unwrap_or(0.0) as f32,
                        receive_blocks: record.receive_blocks.unwrap_or(0.0) as f32,
                        defensive_interceptions: record.defensive_interceptions.unwrap_or(0.0) as u32,
                        pass_interceptions: record.pass_interceptions.unwrap_or(0.0) as u32,
                        damage_carrier: record.damage_carrier.unwrap_or(0.0) as f32
                    };
                    player_stats.insert(id, stats);
                }
            }
            Err(e) => {
                warn!("Error retrieving match player stats {:?}", e);
                return None
            }
        };
        Some(player_stats)
    }
}