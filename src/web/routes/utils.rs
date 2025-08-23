use crate::db::model::match_data::{MatchData, PlayerlessMatchData};
use crate::web::api::GhastApiState;
use crate::web::types::{
    MatchApi, MatchPlayer, MatchPlayerApi, MatchResponse, PlayerData, UberApi,
};
use rocket::State;
use rocket::serde::json::Json;
use std::collections::HashMap;

pub async fn get_matches(
    state: &State<GhastApiState>,
    matches: HashMap<u32, MatchData>,
) -> Json<MatchApi> {
    let mut lock = state.username_resolver.lock().await;
    let mut formed_matches = Vec::with_capacity(matches.len());
    for (id, data) in matches.clone().into_iter() {
        let username_map = lock.resolve_batch(data.players).await;
        formed_matches.push(MatchResponse {
            id,
            data: PlayerlessMatchData {
                server: data.server,
                start_time: data.start_time,
                duration: data.duration,
                winner: data.winner,
                team_one_score: data.team_one_score,
                team_two_score: data.team_two_score,
                map: data.map,
                is_tourney: data.is_tourney,
                team_one_name: data.team_one_name,
                team_two_name: data.team_two_name,
                team_one_color: data.team_one_color,
                team_two_color: data.team_two_color,
            },
            players: username_map
                .iter()
                .map(|(uuid, username)| PlayerData {
                    uuid: *uuid,
                    username: username.clone().unwrap_or(String::from("Unknown")),
                })
                .collect(),
        });
    }

    Json(formed_matches)
}

pub async fn get_match_player_stats(
    match_id: u32,
    state: &State<GhastApiState>,
) -> Option<MatchPlayerApi> {
    let matches = state.database.get_player_match_stats(match_id).await?;
    let mut lock = state.username_resolver.lock().await;
    let keys = matches.keys().cloned().collect::<Vec<_>>();
    let username_map = lock.resolve_batch(keys).await;

    let match_player_stats: Vec<MatchPlayer> = matches
        .into_iter()
        .map(|(uuid, stats)| MatchPlayer {
            username: username_map
                .get(&uuid)
                .cloned()
                .flatten()
                .unwrap_or(String::from("Unknown"))
                .to_owned(),
            uuid: uuid.to_string(),
            stats,
        })
        .collect();

    Some(match_player_stats)
}

pub async fn get_uber_data(match_id: u32, state: &State<GhastApiState>) -> Option<UberApi> {
    let data = state.database.get_match_by_id(match_id).await?;
    let players = get_match_player_stats(match_id, state).await;
    Some(UberApi {
        id: match_id,
        data,
        players: players.unwrap_or(vec![]),
    })
}
