use std::any::Any;
use log::{info, warn};
use reqwest::StatusCode;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub struct MojangApi {
    _private: ()
}

impl MojangApi {
    const API_BASE: &'static str = "https://api.minecraftservices.com";
    const UUID_TO_USERNAME: &'static str = "/minecraft/profile/lookup";

    pub async fn get_username_from_uuid(uuid: Uuid) -> Option<String> {
        info!("Calling mojang API on {}", uuid);
        let url = format!(
            "{}{}/{}", Self::API_BASE, Self::UUID_TO_USERNAME, uuid.to_string()
        );
        let body = reqwest::get(url).await;
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