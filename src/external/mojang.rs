use log::{info, warn};
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use std::any::Any;
use std::time::Duration;
use uuid::Uuid;

pub struct MojangApi {
    client: Client
}

impl MojangApi {
    const API_BASE: &'static str = "https://api.minecraftservices.com";
    const UUID_TO_USERNAME: &'static str = "/minecraft/profile/lookup";

    pub fn new() -> Self {
        MojangApi {
            client: Client::builder()
                .build()
                .unwrap()
        }
    }

    pub async fn get_username_from_uuid(&self, uuid: Uuid) -> Option<String> {
        info!("Calling mojang API on {}", uuid);
        let url = format!(
            "{}{}/{}", Self::API_BASE, Self::UUID_TO_USERNAME, uuid.to_string()
        );
        let body = self.client.get(url).send().await;
        if body.is_err() {
            return None
        }
        let response = body.unwrap();
        info!("Finished {}", uuid);
        if response.status() == StatusCode::OK {
            let response =
                response.json::<UsernameResolveResponse>().await.unwrap();
            Some(response.name)
        } else {
            warn!("Bad response from Mojang API {:?}", response);
            None
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct UsernameResolveResponse {
    pub name: String,
    pub id: String
}