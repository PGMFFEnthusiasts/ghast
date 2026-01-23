use crate::web::api::GhastApiState;
use crate::web::types::{
    TournamentAggregateStats, TournamentDetailedResponse, TournamentListApi,
    TournamentListResponse, TournamentMatchResponse, TournamentMvpResponse, TournamentPlayerInfo,
    TournamentPlayerWithStats, TournamentTeamResponse,
};
use rocket::serde::json::Json;
use rocket::{Build, Rocket, State, get, routes};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

fn make_player_info(
    uuid: &Uuid,
    username_map: &HashMap<Uuid, Option<String>>,
) -> TournamentPlayerInfo {
    TournamentPlayerInfo {
        uuid: uuid.to_string(),
        username: username_map
            .get(uuid)
            .cloned()
            .flatten()
            .unwrap_or_else(|| String::from("Unknown")),
    }
}

fn default_aggregate_stats(team_id: i32) -> TournamentAggregateStats {
    TournamentAggregateStats {
        assists: 0,
        catches: 0,
        damage_carrier: 0.0,
        damage_dealt: 0.0,
        damage_taken: 0.0,
        deaths: 0,
        defensive_interceptions: 0,
        kills: 0,
        killstreak: 0,
        pass_interceptions: 0,
        passes: 0,
        passing_blocks: 0.0,
        pickups: 0,
        receive_blocks: 0.0,
        strips: 0,
        team: team_id,
        throws: 0,
        touchdown_passes: 0,
        touchdowns: 0,
    }
}

fn add_stats(
    agg: TournamentAggregateStats,
    stats: &crate::db::model::player_match_stats::PlayerMatchStats,
) -> TournamentAggregateStats {
    TournamentAggregateStats {
        assists: agg.assists + stats.assists,
        catches: agg.catches + stats.catches,
        damage_carrier: agg.damage_carrier + stats.damage_carrier,
        damage_dealt: agg.damage_dealt + stats.damage_dealt,
        damage_taken: agg.damage_taken + stats.damage_taken,
        deaths: agg.deaths + stats.deaths,
        defensive_interceptions: agg.defensive_interceptions + stats.defensive_interceptions,
        kills: agg.kills + stats.kills,
        killstreak: agg.killstreak.max(stats.killstreak),
        pass_interceptions: agg.pass_interceptions + stats.pass_interceptions,
        passes: agg.passes + stats.passes,
        passing_blocks: agg.passing_blocks + stats.passing_blocks,
        pickups: agg.pickups + stats.pickups,
        receive_blocks: agg.receive_blocks + stats.receive_blocks,
        strips: agg.strips + stats.strips,
        throws: agg.throws + stats.throws,
        touchdown_passes: agg.touchdown_passes + stats.touchdown_passes,
        touchdowns: agg.touchdowns + stats.touchdowns,
        ..agg
    }
}

struct WeightedScores {
    passing: f64,
    receiving: f64,
    defense: f64,
    pvp: f64,
}

impl WeightedScores {
    fn from_aggregate(agg: &TournamentAggregateStats) -> Self {
        Self {
            passing: 0.03 * agg.passing_blocks as f64
                + 11.0 * agg.touchdown_passes as f64
                - 1.4 * agg.pass_interceptions as f64,
            receiving: 0.09 * agg.catches as f64
                + 0.03 * agg.receive_blocks as f64
                + 11.0 * agg.touchdowns as f64,
            defense: 6.0 * agg.defensive_interceptions as f64
                + 6.0 * agg.strips as f64
                + 0.055 * agg.damage_carrier as f64,
            pvp: 0.085 * agg.kills as f64 + 0.015 * agg.damage_dealt,
        }
    }

    #[inline(always)]
    fn offense(&self) -> f64 {
        self.passing + self.receiving
    }

    #[inline(always)]
    fn total(&self) -> f64 {
        self.offense() + self.defense + self.pvp
    }
}

struct RatingScores {
    offense: f64,
    passing: f64,
    receiving: f64,
    defense: f64,
    pvp: f64,
    total: f64,
}

impl RatingScores {
    fn from_weighted(weighted: &WeightedScores, games: u32, avg: &WeightedScores) -> Self {
        let gp = games as f64;
        let bayesian = |w: f64, avg_w: f64| ((w * gp) + (avg_w * 2.0)) / (gp + 2.0);

        Self {
            offense: bayesian(weighted.offense(), avg.offense()),
            passing: bayesian(weighted.passing, avg.passing),
            receiving: bayesian(weighted.receiving, avg.receiving),
            defense: bayesian(weighted.defense, avg.defense),
            pvp: bayesian(weighted.pvp, avg.pvp),
            total: bayesian(weighted.total(), avg.total()),
        }
    }
}

struct IndexScores {
    offense: f64,
    passing: f64,
    receiving: f64,
    defense: f64,
    pvp: f64,
    total: f64,
}

impl IndexScores {
    fn from_rating(rating: &RatingScores, avg_weighted: &WeightedScores) -> Self {
        let safe_div = |val: f64, divisor: f64| {
            if divisor.abs() > 0.001 {
                val / divisor
            } else {
                0.0
            }
        };

        Self {
            offense: safe_div(rating.offense, avg_weighted.offense()),
            passing: safe_div(rating.passing, avg_weighted.passing),
            receiving: safe_div(rating.receiving, avg_weighted.receiving),
            defense: safe_div(rating.defense, avg_weighted.defense),
            pvp: safe_div(rating.pvp, avg_weighted.pvp),
            total: safe_div(rating.total, avg_weighted.total()),
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Hash)]
enum Award {
    Mvp,
    Opot,
    Dpot,
    OlDl,
    Passer,
    Receiver,
}

impl Award {
    const PRIORITY_ORDER: [Self; 6] = [
        Self::Mvp,
        Self::Opot,
        Self::Dpot,
        Self::OlDl,
        Self::Passer,
        Self::Receiver,
    ];

    #[inline(always)]
    fn score(&self, idx: &IndexScores) -> f64 {
        match self {
            Self::Mvp => idx.total,
            Self::Opot => idx.offense,
            Self::Dpot => idx.defense,
            Self::OlDl => idx.pvp,
            Self::Passer => idx.passing,
            Self::Receiver => idx.receiving,
        }
    }
}

struct AwardWinners {
    mvp: Option<Uuid>,
    opot: Option<Uuid>,
    dpot: Option<Uuid>,
    oldl: Option<Uuid>,
    passer: Option<Uuid>,
    receiver: Option<Uuid>,
    all_tournament: Vec<Uuid>,
}

#[get("/all")]
pub async fn get_all_tournaments(state: &State<GhastApiState>) -> Json<TournamentListApi> {
    let tournaments = match state.database.get_tournaments_all().await {
        Some(t) => t,
        None => return Json(Vec::new()),
    };

    let all_captain_uuids: Vec<Uuid> = tournaments
        .iter()
        .flat_map(|t| t.captain_uuids.iter().cloned())
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let mut lock = state.username_resolver.lock().await;
    let username_map = lock.resolve_batch(all_captain_uuids).await;

    let response: Vec<TournamentListResponse> = tournaments
        .into_iter()
        .map(|t| TournamentListResponse {
            id: t.id,
            captains: t
                .captain_uuids
                .iter()
                .map(|uuid| make_player_info(uuid, &username_map))
                .collect(),
            date: t.date,
            match_count: t.match_count,
            name: t.name,
            player_count: t.player_count,
            winner_team_id: t.winner_team_id,
        })
        .collect();

    Json(response)
}

#[get("/<tournament_id>")]
pub async fn get_tournament_by_id(
    tournament_id: u32,
    state: &State<GhastApiState>,
) -> Json<Option<TournamentDetailedResponse>> {
    let tournament = match state.database.get_tournament_by_id(tournament_id).await {
        Some(t) => t,
        None => return Json(None),
    };

    let (teams, team_players, matches) = tokio::join!(
        state.database.get_tournament_teams(tournament_id),
        state.database.get_tournament_team_players(tournament_id),
        state.database.get_tournament_matches(tournament_id),
    );

    let teams = teams.unwrap_or_default();
    let team_players = team_players.unwrap_or_default();
    let matches = matches.unwrap_or_default();

    let match_ids: Vec<u32> = matches.iter().map(|m| m.match_id).collect();
    let stats_by_match = state
        .database
        .get_player_stats_for_matches(&match_ids)
        .await
        .unwrap_or_default();

    let player_team_map: HashMap<Uuid, i32> = team_players
        .iter()
        .map(|p| (p.player_uuid, p.team_id))
        .collect();

    let player_aggregates: HashMap<Uuid, (TournamentAggregateStats, u32)> = stats_by_match
        .values()
        .flat_map(|match_stats| match_stats.iter())
        .fold(HashMap::new(), |acc, (uuid, stats)| {
            let team_id = player_team_map.get(uuid).copied().unwrap_or(0);
            let (current_agg, count) = acc
                .get(uuid)
                .cloned()
                .unwrap_or_else(|| (default_aggregate_stats(team_id), 0));
            let mut new_acc = acc;
            new_acc.insert(*uuid, (add_stats(current_agg, stats), count + 1));
            new_acc
        });

    let player_weighted: Vec<(Uuid, WeightedScores, u32)> = player_aggregates
        .iter()
        .map(|(uuid, (agg, games))| (*uuid, WeightedScores::from_aggregate(agg), *games))
        .collect();

    let n = player_weighted.len() as f64;
    let avg_weighted = player_weighted.iter().fold(
        WeightedScores {
            passing: 0.0,
            receiving: 0.0,
            defense: 0.0,
            pvp: 0.0,
        },
        |acc, (_, w, _)| WeightedScores {
            passing: acc.passing + w.passing / n,
            receiving: acc.receiving + w.receiving / n,
            defense: acc.defense + w.defense / n,
            pvp: acc.pvp + w.pvp / n,
        },
    );

    let player_indexes: Vec<(Uuid, IndexScores)> = player_weighted
        .iter()
        .map(|(uuid, w, games)| {
            let rating = RatingScores::from_weighted(w, *games, &avg_weighted);
            (*uuid, IndexScores::from_rating(&rating, &avg_weighted))
        })
        .collect();

    let (award_map, _) = Award::PRIORITY_ORDER.iter().fold(
        (HashMap::with_capacity(6), HashSet::with_capacity(6)),
        |(map, awarded), &award| match player_indexes
            .iter()
            .filter(|(uuid, _)| !awarded.contains(uuid))
            .max_by(|a, b| award.score(&a.1).total_cmp(&award.score(&b.1)))
            .map(|(uuid, _)| *uuid)
        {
            Some(uuid) => {
                let mut new_map = map;
                let mut new_awarded = awarded;
                new_map.insert(award, uuid);
                new_awarded.insert(uuid);
                (new_map, new_awarded)
            }
            None => (map, awarded),
        },
    );

    let all_tournament: Vec<Uuid> = {
        let mut sorted: Vec<_> = player_indexes.iter().collect();
        sorted.sort_by(|a, b| b.1.total.total_cmp(&a.1.total));
        sorted.into_iter().take(5).map(|(uuid, _)| *uuid).collect()
    };

    let awards = AwardWinners {
        mvp: award_map.get(&Award::Mvp).copied(),
        opot: award_map.get(&Award::Opot).copied(),
        dpot: award_map.get(&Award::Dpot).copied(),
        oldl: award_map.get(&Award::OlDl).copied(),
        passer: award_map.get(&Award::Passer).copied(),
        receiver: award_map.get(&Award::Receiver).copied(),
        all_tournament,
    };

    let all_uuids: HashSet<Uuid> = teams
        .iter()
        .map(|t| t.captain_uuid)
        .chain(team_players.iter().map(|p| p.player_uuid))
        .chain(awards.mvp)
        .chain(awards.opot)
        .chain(awards.dpot)
        .chain(awards.oldl)
        .chain(awards.passer)
        .chain(awards.receiver)
        .chain(awards.all_tournament.iter().copied())
        .collect();

    let mut lock = state.username_resolver.lock().await;
    let username_map = lock.resolve_batch(all_uuids.into_iter().collect()).await;

    let team_responses: Vec<TournamentTeamResponse> = teams
        .iter()
        .map(|team| {
            let captain = make_player_info(&team.captain_uuid, &username_map);

            let players: Vec<TournamentPlayerWithStats> = team_players
                .iter()
                .filter(|p| p.team_id == team.team_id)
                .map(|p| {
                    let stats = player_aggregates
                        .get(&p.player_uuid)
                        .map(|(agg, _)| agg.clone())
                        .unwrap_or_else(|| default_aggregate_stats(team.team_id));

                    TournamentPlayerWithStats {
                        uuid: p.player_uuid.to_string(),
                        username: username_map
                            .get(&p.player_uuid)
                            .cloned()
                            .flatten()
                            .unwrap_or_else(|| String::from("Unknown")),
                        stats,
                    }
                })
                .collect();

            TournamentTeamResponse {
                captain,
                id: team.team_id,
                players,
            }
        })
        .collect();

    let match_responses: Vec<TournamentMatchResponse> = matches
        .iter()
        .map(|m| TournamentMatchResponse {
            duration: m.duration,
            match_id: m.match_id,
            server: m.server.clone(),
            start_time: m.start_time,
            team_one_id: m.team_one_tournament_id,
            team_one_score: m.team_one_score,
            team_two_id: m.team_two_tournament_id,
            team_two_score: m.team_two_score,
        })
        .collect();

    let to_player = |uuid: Option<Uuid>| {
        uuid.map(|u| make_player_info(&u, &username_map))
            .unwrap_or_else(|| TournamentPlayerInfo {
                uuid: String::new(),
                username: String::from("Unknown"),
            })
    };

    let mvp_response = TournamentMvpResponse {
        mvp: to_player(awards.mvp),
        opot: to_player(awards.opot),
        dpot: to_player(awards.dpot),
        passer: to_player(awards.passer),
        receiver: to_player(awards.receiver),
        oldl: to_player(awards.oldl),
    };

    let all_tournament_response: Vec<TournamentPlayerInfo> = awards
        .all_tournament
        .iter()
        .map(|uuid| make_player_info(uuid, &username_map))
        .collect();

    Json(Some(TournamentDetailedResponse {
        all_tournament: all_tournament_response,
        date: tournament.date,
        matches: match_responses,
        mvp: mvp_response,
        name: tournament.name,
        teams: team_responses,
        winner_team_id: tournament.winner_team_id,
    }))
}

pub fn mount(rocket_build: Rocket<Build>) -> Rocket<Build> {
    rocket_build.mount(
        "/tournaments",
        routes![get_all_tournaments, get_tournament_by_id],
    )
}
