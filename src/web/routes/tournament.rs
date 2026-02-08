use crate::db::model::player_match_stats::PlayerMatchStats;
use crate::db::model::tournament::{TournamentMatchMapping, TournamentTeam, TournamentTeamPlayer};
use crate::web::api::GhastApiState;
use crate::web::types::{
    PlayerIndexScores, TournamentAggregateStats, TournamentDetailedResponse, TournamentListApi,
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

fn add_stats(agg: &TournamentAggregateStats, stats: &PlayerMatchStats) -> TournamentAggregateStats {
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
        ..*agg
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
            passing: 0.03f64.mul_add(
                f64::from(agg.passing_blocks),
                11.0f64.mul_add(
                    f64::from(agg.touchdown_passes),
                    -1.4 * f64::from(agg.pass_interceptions),
                ),
            ),
            receiving: 0.09f64.mul_add(
                f64::from(agg.catches),
                0.03f64.mul_add(
                    f64::from(agg.receive_blocks),
                    11.0 * f64::from(agg.touchdowns),
                ),
            ),
            defense: 6.0f64.mul_add(
                f64::from(agg.defensive_interceptions),
                6.0f64.mul_add(f64::from(agg.strips), 0.055 * f64::from(agg.damage_carrier)),
            ),
            pvp: 0.085f64.mul_add(f64::from(agg.kills), 0.015 * agg.damage_dealt),
        }
    }

    fn zero() -> Self {
        Self {
            passing: 0.0,
            receiving: 0.0,
            defense: 0.0,
            pvp: 0.0,
        }
    }

    #[inline]
    fn offense(&self) -> f64 {
        self.passing + self.receiving
    }

    #[inline]
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
        let gp = f64::from(games);
        let bayesian = |w: f64, avg_w: f64| w.mul_add(gp, avg_w * 2.0) / (gp + 2.0);

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

    fn to_player_index_scores(&self) -> PlayerIndexScores {
        PlayerIndexScores {
            offense: self.offense,
            passing: self.passing,
            receiving: self.receiving,
            defense: self.defense,
            pvp: self.pvp,
            total: self.total,
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

    const fn score(self, idx: &IndexScores) -> f64 {
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

fn aggregate_player_stats(
    stats_by_match: &HashMap<u32, HashMap<Uuid, PlayerMatchStats>>,
    match_duration_map: &HashMap<u32, u32>,
    player_team_map: &HashMap<Uuid, i32>,
) -> HashMap<Uuid, (TournamentAggregateStats, u32, u32)> {
    stats_by_match
        .iter()
        .flat_map(|(match_id, match_stats)| {
            let duration = match_duration_map.get(match_id).copied().unwrap_or(0);
            match_stats
                .iter()
                .map(move |(uuid, stats)| (uuid, stats, duration))
        })
        .fold(HashMap::new(), |mut acc, (uuid, stats, duration)| {
            let team_id = player_team_map.get(uuid).copied().unwrap_or(0);
            let (current_agg, count, time) = acc.get(uuid).cloned().unwrap_or_else(|| {
                (
                    TournamentAggregateStats {
                        team: team_id,
                        ..Default::default()
                    },
                    0,
                    0,
                )
            });
            acc.insert(
                *uuid,
                (add_stats(&current_agg, stats), count + 1, time + duration),
            );
            acc
        })
}

fn calculate_player_indexes(
    player_aggregates: &HashMap<Uuid, (TournamentAggregateStats, u32, u32)>,
) -> Vec<(Uuid, IndexScores)> {
    let player_weighted: Vec<(Uuid, WeightedScores, u32)> = player_aggregates
        .iter()
        .map(|(uuid, (agg, games, _time))| (*uuid, WeightedScores::from_aggregate(agg), *games))
        .collect();

    let n = player_weighted.len() as f64;
    let avg_weighted = player_weighted
        .iter()
        .fold(WeightedScores::zero(), |acc, (_, w, _)| WeightedScores {
            passing: acc.passing + w.passing / n,
            receiving: acc.receiving + w.receiving / n,
            defense: acc.defense + w.defense / n,
            pvp: acc.pvp + w.pvp / n,
        });

    player_weighted
        .iter()
        .map(|(uuid, w, games)| {
            let rating = RatingScores::from_weighted(w, *games, &avg_weighted);
            (*uuid, IndexScores::from_rating(&rating, &avg_weighted))
        })
        .collect()
}

fn determine_awards(player_indexes: &[(Uuid, IndexScores)]) -> AwardWinners {
    let (award_map, _) = Award::PRIORITY_ORDER.iter().fold(
        (HashMap::with_capacity(6), HashSet::with_capacity(6)),
        |(mut map, mut awarded), &award| {
            if let Some(uuid) = player_indexes
                .iter()
                .filter(|(uuid, _)| !awarded.contains(uuid))
                .max_by(|a, b| award.score(&a.1).total_cmp(&award.score(&b.1)))
                .map(|(uuid, _)| *uuid)
            {
                map.insert(award, uuid);
                awarded.insert(uuid);
            }
            (map, awarded)
        },
    );

    let all_tournament: Vec<Uuid> = {
        let mut sorted: Vec<_> = player_indexes.iter().collect();
        sorted.sort_unstable_by(|a, b| b.1.total.total_cmp(&a.1.total));
        sorted.into_iter().take(5).map(|(uuid, _)| *uuid).collect()
    };

    AwardWinners {
        mvp: award_map.get(&Award::Mvp).copied(),
        opot: award_map.get(&Award::Opot).copied(),
        dpot: award_map.get(&Award::Dpot).copied(),
        oldl: award_map.get(&Award::OlDl).copied(),
        passer: award_map.get(&Award::Passer).copied(),
        receiver: award_map.get(&Award::Receiver).copied(),
        all_tournament,
    }
}

fn generate_team_response(
    teams: &[TournamentTeam],
    team_players: &[TournamentTeamPlayer],
    player_aggregates: &HashMap<Uuid, (TournamentAggregateStats, u32, u32)>,
    player_index_map: &HashMap<Uuid, &IndexScores>,
    username_map: &HashMap<Uuid, Option<String>>,
) -> Vec<TournamentTeamResponse> {
    teams
        .iter()
        .map(|team| {
            let captain = make_player_info(&team.captain_uuid, username_map);

            let players: Vec<TournamentPlayerWithStats> = team_players
                .iter()
                .filter(|p| p.team_id == team.team_id)
                .map(|p| {
                    let (player_stats, matches_played, time_played) =
                        player_aggregates.get(&p.player_uuid).map_or_else(
                            || {
                                (
                                    TournamentAggregateStats {
                                        team: team.team_id,
                                        ..Default::default()
                                    },
                                    0,
                                    0,
                                )
                            },
                            |(agg, count, time)| (agg.clone(), *count, *time),
                        );

                    let indexes = player_index_map
                        .get(&p.player_uuid)
                        .map(|idx| idx.to_player_index_scores())
                        .unwrap_or_default();

                    TournamentPlayerWithStats {
                        uuid: p.player_uuid.to_string(),
                        username: username_map
                            .get(&p.player_uuid)
                            .cloned()
                            .flatten()
                            .unwrap_or_else(|| String::from("Unknown")),
                        stats: player_stats,
                        matches_played,
                        time_played,
                        indexes,
                    }
                })
                .collect();

            TournamentTeamResponse {
                captain,
                id: team.team_id,
                players,
            }
        })
        .collect()
}

fn generate_match_response(matches: &[TournamentMatchMapping]) -> Vec<TournamentMatchResponse> {
    matches
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
        .collect()
}

fn generate_mvp_response(
    awards: &AwardWinners,
    username_map: &HashMap<Uuid, Option<String>>,
) -> TournamentMvpResponse {
    let to_player = |uuid: Option<Uuid>| {
        uuid.map_or_else(
            || TournamentPlayerInfo {
                uuid: String::new(),
                username: String::from("Unknown"),
            },
            |u| make_player_info(&u, username_map),
        )
    };

    TournamentMvpResponse {
        mvp: to_player(awards.mvp),
        opot: to_player(awards.opot),
        dpot: to_player(awards.dpot),
        passer: to_player(awards.passer),
        receiver: to_player(awards.receiver),
        oldl: to_player(awards.oldl),
    }
}

#[get("/all")]
pub async fn get_all_tournaments(state: &State<GhastApiState>) -> Json<TournamentListApi> {
    let Some(tournaments) = state.database.get_tournaments_all().await else {
        return Json(Vec::new());
    };

    let all_captain_uuids: Vec<Uuid> = tournaments
        .iter()
        .flat_map(|t| t.captain_uuids.iter().copied())
        .collect::<HashSet<_>>()
        .into_iter()
        .collect();

    let username_map = {
        let lock = state.username_resolver.lock().await;
        lock.resolve_batch(all_captain_uuids).await
    };

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
    let Some(tournament) = state.database.get_tournament_by_id(tournament_id).await else {
        return Json(None);
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
    let match_duration_map: HashMap<u32, u32> =
        matches.iter().map(|m| (m.match_id, m.duration)).collect();
    let stats_by_match = state
        .database
        .get_player_stats_for_matches(&match_ids)
        .await
        .unwrap_or_default();

    let player_team_map: HashMap<Uuid, i32> = team_players
        .iter()
        .map(|p| (p.player_uuid, p.team_id))
        .collect();

    let player_aggregates =
        aggregate_player_stats(&stats_by_match, &match_duration_map, &player_team_map);
    let player_indexes = calculate_player_indexes(&player_aggregates);
    let player_index_map: HashMap<Uuid, &IndexScores> = player_indexes
        .iter()
        .map(|(uuid, idx)| (*uuid, idx))
        .collect();

    let awards = determine_awards(&player_indexes);

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

    let username_map = {
        let lock = state.username_resolver.lock().await;
        lock.resolve_batch(all_uuids.into_iter().collect()).await
    };

    let team_responses = generate_team_response(
        &teams,
        &team_players,
        &player_aggregates,
        &player_index_map,
        &username_map,
    );
    let match_responses = generate_match_response(&matches);
    let mvp_response = generate_mvp_response(&awards, &username_map);

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
