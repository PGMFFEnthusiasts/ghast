use crate::external::mojang::MojangApi;
use crate::util::cached_accessor::LoadingCacheDataAccessor;
use moka::future::Cache;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use uuid::Uuid;

pub struct UsernameResolver {
    loading_cache: LoadingCacheDataAccessor<Uuid, String>
}

impl UsernameResolver {
    pub fn create() -> UsernameResolver {
        UsernameResolver {
            loading_cache: LoadingCacheDataAccessor {
                loader: Arc::new(|x| Box::pin(MojangApi::get_username_from_uuid(x))),
                cache: Cache::builder()
                    // 2 hrs
                    .time_to_live(Duration::from_secs(60 * 60 * 2))
                    .max_capacity(2048)
                    .build()
            }
        }
    }

    // pub async fn resolve(&mut self, uuid: Uuid) -> String {
    //     self.loading_cache.get(uuid).await
    // }

    pub async fn resolve_batch(&mut self, uuid: Vec<Uuid>) -> HashMap<Uuid, Option<String>> {
        self.loading_cache.get_batch(uuid).await
    }
}