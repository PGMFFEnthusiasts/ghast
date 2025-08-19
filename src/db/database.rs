use crate::db::model::match_data::{MatchData, PlayerlessMatchData};
use crate::db::model::player_match_stats::PlayerMatchStats;
use chrono::{DateTime, Utc};
use log::warn;
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};
use std::collections::HashMap;
use std::str::from_utf8;
use uuid::Uuid;

pub struct Database {
    connection_pool: Pool<Postgres>,
}

impl Database {
    pub async fn new(database_path: &str) -> Self {
        let pool = PgPoolOptions::new()
            .max_connections(4)
            .connect(format!("postgres://{database_path}").as_str())
            .await
            .unwrap();
        Database {
            connection_pool: pool,
        }
    }

    pub async fn get_match_by_id(&self, id: u32) -> Option<PlayerlessMatchData> {
        let result = sqlx::query!(
            r#"
     SELECT m.server, m.start_time, m.duration, m.winner, m.team_one_score, m.team_two_score,
       m.map, m.is_tourney, m.team_one_name, m.team_two_name, m.team_one_color, m.team_two_color
     FROM match_data m LEFT JOIN player_match_data p ON m.match = p.match
     WHERE m.match = $1
     GROUP BY m.match
     "#,
            id as i32
        )
        .fetch_all(&self.connection_pool)
        .await;
        match result {
            Ok(mut records) => {
                if records.is_empty() {
                    return None;
                }
                let record = records.remove(0);
                Some(PlayerlessMatchData {
                    server: record.server,
                    start_time: record.start_time as u64,
                    duration: record.duration as u32,
                    winner: record.winner,
                    team_one_score: record.team_one_score as u32,
                    team_two_score: record.team_two_score as u32,
                    map: record.map,
                    is_tourney: record.is_tourney,
                    team_one_name: record.team_one_name.unwrap_or(String::from("Unknown")),
                    team_two_name: record.team_two_name.unwrap_or(String::from("Unknown")),
                    team_one_color: record.team_one_color.map(|n| n as u32),
                    team_two_color: record.team_two_color.map(|n| n as u32),
                })
            }
            Err(e) => {
                warn!("Error retrieving matches {e:?}");
                None
            }
        }
    }

    pub async fn get_matches_all(&self) -> Option<HashMap<u32, MatchData>> {
        let result = sqlx::query!(
                r#"
    SELECT m.match, m.server, m.start_time, m.duration, m.winner, m.team_one_score, m.team_two_score,
           m.map, m.is_tourney, m.team_one_name, m.team_two_name, m.team_one_color, m.team_two_color,
           COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.player), NULL), '{}'::bytea[]) players
    FROM match_data m LEFT JOIN player_match_data p ON p.match = m.match
    GROUP BY m.match
    ORDER BY start_time DESC
    "#,
            )
            .fetch_all(&self.connection_pool)
            .await;
        let mut match_data: HashMap<u32, MatchData> = HashMap::new();
        match result {
            Ok(records) => {
                if records.is_empty() {
                    return None;
                }
                for record in records {
                    let datum = MatchData {
                        server: record.server,
                        start_time: record.start_time as u64,
                        duration: record.duration as u32,
                        winner: record.winner,
                        team_one_score: record.team_one_score as u32,
                        team_two_score: record.team_two_score as u32,
                        map: record.map,
                        is_tourney: record.is_tourney,
                        team_one_name: record.team_one_name.unwrap_or(String::from("Unknown")),
                        team_two_name: record.team_two_name.unwrap_or(String::from("Unknown")),
                        team_one_color: record.team_one_color.map(|n| n as u32),
                        team_two_color: record.team_two_color.map(|n| n as u32),
                        players: record
                            .players
                            .unwrap_or(Vec::new())
                            .into_iter()
                            .map(Database::parse_uuid)
                            .collect(),
                    };
                    match_data.insert(record.r#match as u32, datum);
                }
                Some(match_data)
            }
            Err(e) => {
                warn!("Error retrieving matches {e:?}");
                None
            }
        }
    }

    pub async fn get_matches_between(
        &self,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    ) -> Option<HashMap<u32, MatchData>> {
        let start_time_millis = start_time.timestamp_millis();
        let end_time_millis = end_time.timestamp_millis();
        let result = sqlx::query!(
            r#"
     SELECT m.match, m.server, m.start_time, m.duration, m.winner, m.team_one_score, m.team_two_score,
       m.map, m.is_tourney, m.team_one_name, m.team_two_name, m.team_one_color, m.team_two_color,
       COALESCE(ARRAY_REMOVE(ARRAY_AGG(p.player), NULL), '{}'::bytea[]) players
     FROM match_data m LEFT JOIN player_match_data p ON m.match = p.match
     WHERE m.start_time >= $1 AND m.start_time <= $2
     GROUP BY m.match
     "#,
            start_time_millis,
            end_time_millis
        )
        .fetch_all(&self.connection_pool)
        .await;
        let mut match_data: HashMap<u32, MatchData> = HashMap::new();
        match result {
            Ok(records) => {
                if records.is_empty() {
                    return None;
                }
                for record in records {
                    let datum = MatchData {
                        server: record.server,
                        start_time: record.start_time as u64,
                        duration: record.duration as u32,
                        winner: record.winner,
                        team_one_score: record.team_one_score as u32,
                        team_two_score: record.team_two_score as u32,
                        map: record.map,
                        is_tourney: record.is_tourney,
                        team_one_name: record.team_one_name.unwrap_or(String::from("Unknown")),
                        team_two_name: record.team_two_name.unwrap_or(String::from("Unknown")),
                        team_one_color: record.team_one_color.map(|n| n as u32),
                        team_two_color: record.team_two_color.map(|n| n as u32),
                        players: record
                            .players
                            .unwrap_or(Vec::new())
                            .into_iter()
                            .map(Database::parse_uuid)
                            .collect(),
                    };
                    match_data.insert(record.r#match as u32, datum);
                }
                Some(match_data)
            }
            Err(e) => {
                warn!("Error retrieving matches {e:?}");
                None
            }
        }
    }

    pub async fn get_player_match_stats(
        &self,
        match_id: u32,
    ) -> Option<HashMap<Uuid, PlayerMatchStats>> {
        let result = sqlx::query!(
            r#"
     SELECT player, team, kills, deaths, assists, killstreak, dmg_dealt, dmg_taken, pickups,
     throws, passes, catches, strips, touchdowns, touchdown_passes, passing_blocks, receive_blocks,
     defensive_interceptions, pass_interceptions, damage_carrier
     FROM player_match_data
     WHERE match = $1"#,
            match_id as i32
        )
        .fetch_all(&self.connection_pool)
        .await;
        let mut player_stats: HashMap<Uuid, PlayerMatchStats> = HashMap::new();
        match result {
            Ok(rows) => {
                if rows.is_empty() {
                    return None;
                }
                for record in &rows {
                    let id = {
                        let uuid_blob = record.player.clone();
                        let s = if uuid_blob.len() == 16 {
                            Uuid::from_bytes(Self::vec_as_arr(uuid_blob))
                                .hyphenated()
                                .to_string()
                        } else {
                            from_utf8(&uuid_blob[..]).unwrap().to_string()
                        };
                        Uuid::parse_str(s.as_str()).unwrap()
                    };
                    let stats = PlayerMatchStats {
                        team: record.team,
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
                        defensive_interceptions: record.defensive_interceptions.unwrap_or(0.0)
                            as u32,
                        pass_interceptions: record.pass_interceptions.unwrap_or(0.0) as u32,
                        damage_carrier: record.damage_carrier.unwrap_or(0.0) as f32,
                    };
                    player_stats.insert(id, stats);
                }
            }
            Err(e) => {
                warn!("Error retrieving match player stats {e:?}");
                return None;
            }
        };
        Some(player_stats)
    }

    pub async fn get_username_from_uuid(&self, uuid: Uuid) -> Option<String> {
        let uuid_bytes = uuid.as_bytes().to_vec();

        let name = sqlx::query_scalar!(
            r#"SELECT name FROM player_identities WHERE uuid = $1"#,
            uuid_bytes.as_slice()
        )
        .fetch_optional(&self.connection_pool)
        .await
        .ok()
        .flatten();

        if name.is_some() {
            return name;
        }

        let uuid_hyphenated_string = uuid.hyphenated().to_string();
        let uuid_bytes = uuid_hyphenated_string.as_bytes();
        let name = sqlx::query_scalar!(
            r#"SELECT name FROM player_identities WHERE uuid = $1"#,
            uuid_bytes
        )
        .fetch_optional(&self.connection_pool)
        .await
        .ok()
        .flatten();

        if name.is_some() {
            return name;
        }

        None
    }
    fn parse_uuid(v: Vec<u8>) -> Uuid {
        let s = if v.len() == 16 {
            Uuid::from_bytes(Self::vec_as_arr(v))
                .hyphenated()
                .to_string()
        } else {
            from_utf8(&v[..]).unwrap().to_string()
        };
        Uuid::parse_str(s.as_str()).unwrap()
    }

    fn vec_as_arr<T, const N: usize>(v: Vec<T>) -> [T; N] {
        v.try_into().unwrap_or_else(|v: Vec<T>| {
            panic!("Expected a Vec of length {} but it was {}", N, v.len())
        })
    }
}
