use crate::web::api::GhastApiState;
use crate::web::types::{PlayerAggregateResponse, PlayerAggregateStats};
use rocket::serde::json::Json;
use rocket::{Build, Rocket, State, get, routes};
use uuid::Uuid;

#[get("/<player>")]
pub async fn get_player(
    player: &str,
    state: &State<GhastApiState>,
) -> Json<Option<PlayerAggregateResponse>> {
    let uuid = match Uuid::parse_str(player) {
        Ok(uuid) => uuid,
        Err(_) => match state.database.get_uuid_from_username(player).await {
            Some(uuid) => uuid,
            None => return Json(None),
        },
    };

    let Some(match_stats) = state.database.get_player_all_match_stats(uuid).await else {
        return Json(None);
    };

    let matches_played = match_stats.len() as u32;
    let time_played: u64 = match_stats
        .iter()
        .map(|(_, duration)| u64::from(*duration))
        .sum();

    let stats = match_stats
        .iter()
        .fold(PlayerAggregateStats::default(), |acc, (s, _)| {
            PlayerAggregateStats {
                assists: acc.assists + s.assists,
                catches: acc.catches + s.catches,
                damage_carrier: acc.damage_carrier + s.damage_carrier,
                damage_dealt: acc.damage_dealt + s.damage_dealt,
                damage_taken: acc.damage_taken + s.damage_taken,
                deaths: acc.deaths + s.deaths,
                defensive_interceptions: acc.defensive_interceptions + s.defensive_interceptions,
                kills: acc.kills + s.kills,
                killstreak: acc.killstreak.max(s.killstreak),
                pass_interceptions: acc.pass_interceptions + s.pass_interceptions,
                passes: acc.passes + s.passes,
                passing_blocks: acc.passing_blocks + s.passing_blocks,
                pickups: acc.pickups + s.pickups,
                receive_blocks: acc.receive_blocks + s.receive_blocks,
                strips: acc.strips + s.strips,
                throws: acc.throws + s.throws,
                touchdown_passes: acc.touchdown_passes + s.touchdown_passes,
                touchdowns: acc.touchdowns + s.touchdowns,
            }
        });

    let username = {
        let lock = state.username_resolver.lock().await;
        lock.resolve_batch(vec![uuid])
            .await
            .get(&uuid)
            .cloned()
            .flatten()
            .unwrap_or_else(|| String::from("Unknown"))
    };

    Json(Some(PlayerAggregateResponse {
        uuid: uuid.to_string(),
        username,
        matches_played,
        time_played,
        stats,
    }))
}

pub fn mount(rocket_build: Rocket<Build>) -> Rocket<Build> {
    rocket_build.mount("/players", routes![get_player])
}
