use crate::web::api::GhastApiState;
use crate::web::routes::utils::{get_match_player_stats, get_matches, get_uber_data};
use crate::web::types::{MatchApi, MatchPlayerApi, PlayerlessMatchApi, UberApi};
use ::std::ops::Sub;
use chrono::{TimeDelta, Utc};
use rocket::serde::json::Json;
use rocket::{Build, Rocket, State, get, routes};

#[get("/all")]
pub async fn get_all_matches(state: &State<GhastApiState>) -> Json<MatchApi> {
    if let Some(matches) = state.database.get_matches_all().await {
        return get_matches(state, matches).await;
    }

    Json(Vec::new())
}

#[get("/recent")]
pub async fn get_recent_matches(state: &State<GhastApiState>) -> Json<MatchApi> {
    if let Some(matches) = state
        .database
        .get_matches_between(Utc::now().sub(TimeDelta::days(3)), Utc::now())
        .await
    {
        return get_matches(state, matches).await;
    }

    Json(Vec::new())
}

#[get("/<match_id>")]
pub async fn get_match_from_id(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Json<Option<PlayerlessMatchApi>> {
    let data = state.database.get_match_by_id(match_id).await;
    Json(data.map(|data| PlayerlessMatchApi { id: match_id, data }))
}

#[get("/<match_id>/uber")]
pub async fn get_match_uber(match_id: u32, state: &State<GhastApiState>) -> Json<Option<UberApi>> {
    return Json(get_uber_data(match_id, state).await);
}

#[get("/<match_id>/player_stats")]
pub async fn get_player_stats_for_match(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Option<Json<MatchPlayerApi>> {
    if let Some(v) = get_match_player_stats(match_id, state).await {
        return Some(Json(v));
    };

    None
}

pub fn mount(rocket_build: Rocket<Build>) -> Rocket<Build> {
    rocket_build.mount(
        "/matches",
        routes![
            get_all_matches,
            get_recent_matches,
            get_match_from_id,
            get_player_stats_for_match,
            get_match_uber,
        ],
    )
}
