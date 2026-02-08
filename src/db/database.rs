use crate::db::model::match_data::{MatchData, PlayerlessMatchData};
use crate::db::model::player_match_stats::PlayerMatchStats;
use crate::db::model::tournament::{
    TournamentBase, TournamentMatchMapping, TournamentTeam, TournamentTeamPlayer,
    TournamentWithCounts,
};
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
        Self {
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
                    team_one_name: record
                        .team_one_name
                        .unwrap_or_else(|| String::from("Unknown")),
                    team_two_name: record
                        .team_two_name
                        .unwrap_or_else(|| String::from("Unknown")),
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
                        team_one_name: record
                            .team_one_name
                            .unwrap_or_else(|| String::from("Unknown")),
                        team_two_name: record
                            .team_two_name
                            .unwrap_or_else(|| String::from("Unknown")),
                        team_one_color: record.team_one_color.map(|n| n as u32),
                        team_two_color: record.team_two_color.map(|n| n as u32),
                        players: record
                            .players
                            .unwrap_or(Vec::new())
                            .into_iter()
                            .map(Self::parse_uuid)
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
                        team_one_name: record
                            .team_one_name
                            .unwrap_or_else(|| String::from("Unknown")),
                        team_two_name: record
                            .team_two_name
                            .unwrap_or_else(|| String::from("Unknown")),
                        team_one_color: record.team_one_color.map(|n| n as u32),
                        team_two_color: record.team_two_color.map(|n| n as u32),
                        players: record
                            .players
                            .unwrap_or(Vec::new())
                            .into_iter()
                            .map(Self::parse_uuid)
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
        }
        Some(player_stats)
    }

    #[allow(dead_code)]
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

    pub async fn get_usernames_from_uuids(&self, uuids: &[Uuid]) -> HashMap<Uuid, String> {
        let uuid_bytes: Vec<Vec<u8>> = uuids.iter().map(|u| u.as_bytes().to_vec()).collect();
        let rows = sqlx::query!(
            r#"
            SELECT name, uuid
            FROM player_identities
            WHERE uuid = ANY($1)
            "#,
            &uuid_bytes
        )
        .fetch_all(&self.connection_pool)
        .await
        .expect("DB query failed");

        let mut map = HashMap::new();
        for row in rows {
            map.insert(Self::parse_uuid(row.uuid), row.name);
        }
        map
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

    pub async fn get_tournaments_all(&self) -> Option<Vec<TournamentWithCounts>> {
        let result = sqlx::query!(
            r#"
            SELECT
                t.id,
                t.name,
                t.date,
                t.winner_team_id,
                COUNT(DISTINCT tm.match_id) as match_count,
                COUNT(DISTINCT ttp.player_uuid) as player_count,
                (SELECT COALESCE(ARRAY_AGG(captain_uuid ORDER BY team_id), '{}'::bytea[])
                 FROM tournament_team WHERE tournament_id = t.id) as captain_uuids
            FROM tournament t
            LEFT JOIN tournament_match tm ON tm.tournament_id = t.id
            LEFT JOIN tournament_team_player ttp ON ttp.tournament_id = t.id
            GROUP BY t.id
            ORDER BY t.date DESC
            "#
        )
        .fetch_all(&self.connection_pool)
        .await;

        match result {
            Ok(records) => {
                let tournaments: Vec<TournamentWithCounts> = records
                    .into_iter()
                    .map(|record| TournamentWithCounts {
                        id: record.id as u32,
                        name: record.name,
                        date: record.date as u64,
                        winner_team_id: record.winner_team_id,
                        match_count: record.match_count.unwrap_or(0) as u32,
                        player_count: record.player_count.unwrap_or(0) as u32,
                        captain_uuids: record
                            .captain_uuids
                            .unwrap_or_default()
                            .into_iter()
                            .map(Self::parse_uuid)
                            .collect(),
                    })
                    .collect();
                Some(tournaments)
            }
            Err(e) => {
                warn!("Error retrieving tournaments {e:?}");
                None
            }
        }
    }

    pub async fn get_tournament_by_id(&self, id: u32) -> Option<TournamentBase> {
        let result = sqlx::query!(
            r#"
            SELECT id, name, date, winner_team_id
            FROM tournament
            WHERE id = $1
            "#,
            id as i32
        )
        .fetch_optional(&self.connection_pool)
        .await;

        match result {
            Ok(Some(record)) => Some(TournamentBase {
                id: record.id as u32,
                name: record.name,
                date: record.date as u64,
                winner_team_id: record.winner_team_id,
            }),
            Ok(None) => None,
            Err(e) => {
                warn!("Error retrieving tournament {id}: {e:?}");
                None
            }
        }
    }

    pub async fn get_tournament_teams(&self, tournament_id: u32) -> Option<Vec<TournamentTeam>> {
        let result = sqlx::query!(
            r#"
            SELECT tournament_id, team_id, captain_uuid
            FROM tournament_team
            WHERE tournament_id = $1
            ORDER BY team_id
            "#,
            tournament_id as i32
        )
        .fetch_all(&self.connection_pool)
        .await;

        match result {
            Ok(records) => {
                let teams: Vec<TournamentTeam> = records
                    .into_iter()
                    .map(|record| TournamentTeam {
                        tournament_id: record.tournament_id as u32,
                        team_id: record.team_id,
                        captain_uuid: Self::parse_uuid(record.captain_uuid),
                    })
                    .collect();
                Some(teams)
            }
            Err(e) => {
                warn!("Error retrieving tournament teams: {e:?}");
                None
            }
        }
    }

    pub async fn get_tournament_team_players(
        &self,
        tournament_id: u32,
    ) -> Option<Vec<TournamentTeamPlayer>> {
        let result = sqlx::query!(
            r#"
            SELECT tournament_id, team_id, player_uuid
            FROM tournament_team_player
            WHERE tournament_id = $1
            ORDER BY team_id
            "#,
            tournament_id as i32
        )
        .fetch_all(&self.connection_pool)
        .await;

        match result {
            Ok(records) => {
                let players: Vec<TournamentTeamPlayer> = records
                    .into_iter()
                    .map(|record| TournamentTeamPlayer {
                        tournament_id: record.tournament_id as u32,
                        team_id: record.team_id,
                        player_uuid: Self::parse_uuid(record.player_uuid),
                    })
                    .collect();
                Some(players)
            }
            Err(e) => {
                warn!("Error retrieving tournament team players: {e:?}");
                None
            }
        }
    }

    pub async fn get_tournament_matches(
        &self,
        tournament_id: u32,
    ) -> Option<Vec<TournamentMatchMapping>> {
        let result = sqlx::query!(
            r#"
            SELECT
                tm.tournament_id,
                tm.match_id,
                tm.team_one_tournament_id,
                tm.team_two_tournament_id,
                m.duration,
                m.server,
                m.start_time,
                m.team_one_score,
                m.team_two_score
            FROM tournament_match tm
            JOIN match_data m ON m.match = tm.match_id
            WHERE tm.tournament_id = $1
            ORDER BY m.start_time
            "#,
            tournament_id as i32
        )
        .fetch_all(&self.connection_pool)
        .await;

        match result {
            Ok(records) => {
                let matches: Vec<TournamentMatchMapping> = records
                    .into_iter()
                    .map(|record| TournamentMatchMapping {
                        tournament_id: record.tournament_id as u32,
                        match_id: record.match_id as u32,
                        team_one_tournament_id: record.team_one_tournament_id,
                        team_two_tournament_id: record.team_two_tournament_id,
                        duration: record.duration as u32,
                        server: record.server,
                        start_time: record.start_time as u64,
                        team_one_score: record.team_one_score as u32,
                        team_two_score: record.team_two_score as u32,
                    })
                    .collect();
                Some(matches)
            }
            Err(e) => {
                warn!("Error retrieving tournament matches: {e:?}");
                None
            }
        }
    }

    pub async fn get_player_stats_for_matches(
        &self,
        match_ids: &[u32],
    ) -> Option<HashMap<u32, HashMap<Uuid, PlayerMatchStats>>> {
        let match_ids_i32: Vec<i32> = match_ids.iter().map(|&id| id as i32).collect();
        let result = sqlx::query!(
            r#"
            SELECT match, player, team, kills, deaths, assists, killstreak, dmg_dealt, dmg_taken,
                   pickups, throws, passes, catches, strips, touchdowns, touchdown_passes,
                   passing_blocks, receive_blocks, defensive_interceptions, pass_interceptions,
                   damage_carrier
            FROM player_match_data
            WHERE match = ANY($1)
            "#,
            &match_ids_i32
        )
        .fetch_all(&self.connection_pool)
        .await;

        match result {
            Ok(rows) => {
                let mut stats_by_match: HashMap<u32, HashMap<Uuid, PlayerMatchStats>> =
                    HashMap::new();
                for record in rows {
                    let match_id = record.r#match as u32;
                    let uuid = Self::parse_uuid(record.player);
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
                    stats_by_match
                        .entry(match_id)
                        .or_default()
                        .insert(uuid, stats);
                }
                Some(stats_by_match)
            }
            Err(e) => {
                warn!("Error retrieving player stats for matches: {e:?}");
                None
            }
        }
    }
}
