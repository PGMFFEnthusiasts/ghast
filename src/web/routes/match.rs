use std::collections::HashMap;
use std::ops::Sub;
use chrono::{TimeDelta, Utc};
use rocket::{get, routes, Build, Rocket, State};
use rocket::serde::json::Json;
use serde::{Deserialize, Serialize};
use crate::db::model::match_data::MatchData;
use crate::db::model::player_match_stats::PlayerFootballStats;
use crate::web::api::GhastApiState;

#[get("/recent")]
pub async fn get_recent_matches(state: &State<GhastApiState>) -> Json<Vec<IdentifiedMatchData>> {
    let matches_option =
        state.database.get_matches_timespan(Utc::now().sub(TimeDelta::days(3)), Utc::now()).await;
    match matches_option {
        Some(matches) => {
            let mut result : Vec<IdentifiedMatchData> = Vec::new();
            for (id, data) in matches.into_iter() {
                result.push(IdentifiedMatchData {
                    id,
                    data,
                });
            }
            Json(result)
        },
        None => Json(Vec::new())
    }
}

#[get("/<match_id>")]
pub async fn get_match_data(
    match_id: u32, state: &State<GhastApiState>
) -> Json<Option<IdentifiedMatchData>> {
    let data = state.database.get_match_by_id(match_id).await;
    Json(match data {
        None => None,
        Some(data) => Some(IdentifiedMatchData { id: match_id, data })
    })
}

#[derive(Serialize, Deserialize)]
pub struct IdentifiedMatchData {
    id: u32,
    data: MatchData
}

#[get("/<match_id>/player_stats")]
pub async fn get_player_stats_for_match(
    match_id: u32, state: &State<GhastApiState>
) -> Json<Vec<IdentifiedPlayerMatchStats>> {
    let matches_option =
        state.database.get_player_match_stats(match_id).await;
    match matches_option {
        Some(matches) => {
            let mut match_player_stats : Vec<IdentifiedPlayerMatchStats> = Vec::new();
            let mut lock = state.username_resolver.lock().await;
            let keys = matches.keys().cloned().collect::<Vec<_>>();
            let username_map = lock.resolve_batch(keys).await;
            for (uuid, stats) in matches.into_iter() {
                let username = username_map
                    .get(&uuid)
                    .cloned()
                    .flatten()
                    .unwrap_or(String::from("Unknown"))
                    .to_owned();
                match_player_stats.push(IdentifiedPlayerMatchStats {
                    username,
                    uuid: uuid.to_string(),
                    stats
                });
            }
            Json(match_player_stats)
        },
        None => Json(Vec::new())
    }
}

#[derive(Serialize, Deserialize)]
pub struct IdentifiedPlayerMatchStats {
    username: String,
    uuid: String,
    stats: PlayerFootballStats
}

pub fn mount(rocket_build: Rocket<Build>) -> Rocket<Build> {
    rocket_build.mount(
        "/matches", routes![
            get_recent_matches, get_match_data, get_player_stats_for_match
        ]
    )
}