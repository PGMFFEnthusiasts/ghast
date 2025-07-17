mod db;
mod external;
mod util;
mod web;

use crate::db::database::Database;
use crate::util::username_resolver::UsernameResolver;
use crate::web::api::{GhastApiState, rocket};
use log::warn;
use std::sync::Arc;
use tokio::sync::Mutex;

#[tokio::main]
async fn main() {
    let db = Arc::new(
        Database::new(
            std::env::var("GHAST_DATABASE_PATH")
                .unwrap_or(String::from("sqlite:./data/sample.db"))
                .as_str(),
        )
        .await,
    );
    let username_resolver = UsernameResolver::create(db.clone());
    let end_result = rocket(GhastApiState {
        database: db.clone(),
        username_resolver: Arc::new(Mutex::new(username_resolver)),
    })
    .launch()
    .await;
    if let Err(e) = end_result {
        warn!("{e}");
    };
}
