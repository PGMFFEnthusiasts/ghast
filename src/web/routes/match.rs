use crate::db::model::match_data::MatchData;
use crate::db::model::player_match_stats::PlayerFootballStats;
use crate::web::api::GhastApiState;
use chrono::{TimeDelta, Utc};
use rocket::serde::json::Json;
use rocket::{Build, Rocket, State, get, routes};
use serde::{Deserialize, Serialize};
use std::ops::Sub;

#[get("/recent")]
pub async fn get_recent_matches(state: &State<GhastApiState>) -> Json<Vec<IdentifiedMatchData>> {
    let matches_option = state
        .database
        .get_matches_timespan(Utc::now().sub(TimeDelta::days(3)), Utc::now())
        .await;
    match matches_option {
        Some(matches) => {
            let mut result: Vec<IdentifiedMatchData> = Vec::new();
            for (id, data) in matches.into_iter() {
                result.push(IdentifiedMatchData { id, data });
            }
            Json(result)
        }
        None => Json(Vec::new()),
    }
}

#[get("/<match_id>")]
pub async fn get_match_data(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Json<Option<IdentifiedMatchData>> {
    let data = state.database.get_match_by_id(match_id).await;
    Json(data.map(|data| IdentifiedMatchData { id: match_id, data }))
}

#[derive(Serialize, Deserialize)]
pub struct IdentifiedMatchData {
    id: u32,
    data: MatchData,
}

#[get("/<match_id>/uber")]
pub async fn get_match_uber(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Json<Option<UberIdentifiedMatchData>> {
    return Json(get_uber_data(match_id, state).await);
}

async fn get_uber_data(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Option<UberIdentifiedMatchData> {
    let data = state.database.get_match_by_id(match_id).await?;
    let players = get_identified_player_match_stats(match_id, state).await?;
    Some(UberIdentifiedMatchData {
        id: match_id,
        data,
        players,
    })
}

#[derive(Serialize, Deserialize)]
pub struct UberIdentifiedMatchData {
    id: u32,
    data: MatchData,
    players: Vec<IdentifiedPlayerMatchStats>,
}

#[get("/<match_id>/player_stats")]
pub async fn get_player_stats_for_match(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Json<Vec<IdentifiedPlayerMatchStats>> {
    if let Some(v) = get_identified_player_match_stats(match_id, state).await {
        return Json(v);
    };

    Json(vec![])
}

async fn get_identified_player_match_stats(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Option<Vec<IdentifiedPlayerMatchStats>> {
    let matches = state.database.get_player_match_stats(match_id).await?;
    let mut match_player_stats: Vec<IdentifiedPlayerMatchStats> = Vec::new();
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
            stats,
        });
    }
    Some(match_player_stats)
}

#[derive(Serialize, Deserialize)]
pub struct IdentifiedPlayerMatchStats {
    username: String,
    uuid: String,
    stats: PlayerFootballStats,
}

pub fn mount(rocket_build: Rocket<Build>) -> Rocket<Build> {
    rocket_build.mount(
        "/matches",
        routes![
            get_recent_matches,
            get_match_data,
            get_player_stats_for_match,
            get_match_uber,
        ],
    )
}
