use crate::db::database::Database;
use crate::util::username_resolver::UsernameResolver;
use crate::web::routes;
use rocket::figment::Figment;
use rocket::http::Method;
use rocket::{Build, Config, Rocket};
use rocket_cors::{AllowedOrigins, CorsOptions};
use std::net::{IpAddr, Ipv4Addr};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct GhastApiState {
    pub database: Arc<Database>,
    pub username_resolver: Arc<Mutex<UsernameResolver>>,
}

fn get_cors_configuration() -> CorsOptions {
    CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![Method::Get, Method::Post]
                .into_iter()
                .map(From::from)
                .collect(),
        )
        .allow_credentials(true)
}

pub fn rocket(state: GhastApiState) -> Rocket<Build> {
    let is_debug = false;
    let http_port = 8000;
    let config: Config = Figment::from(if is_debug {
        Config::debug_default()
    } else {
        Config::release_default()
    })
    .merge::<(&str, IpAddr)>(("address", Ipv4Addr::new(0, 0, 0, 0).into()))
    .merge(("port", http_port))
    .extract()
    .unwrap();
    let cors = get_cors_configuration().to_cors().unwrap();
    let mut build = rocket::custom(config).attach(cors).manage(state);
    build = routes::r#match::mount(build);
    build = routes::tournament::mount(build);
    build
}
