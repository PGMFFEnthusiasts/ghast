use crate::external::mojang::MojangApi;
use crate::util::cached_accessor::LoadingCacheDataAccessor;
use moka::future::Cache;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use tokio::task::JoinSet;
use uuid::Uuid;
use crate::db::database::Database;

pub struct UsernameResolver {
    loading_cache: LoadingCacheDataAccessor<Uuid, String>,
    database: Arc<Database>
}

impl UsernameResolver {
    pub fn create(database: Arc<Database>) -> UsernameResolver {
        let mojang_api = Arc::new(MojangApi::new());
        UsernameResolver {
            loading_cache: LoadingCacheDataAccessor {
                // loader: Arc::new(move |x| Box::pin(mojang_api.get_username_from_uuid(x))),
                loader: Arc::new(move |x| {
                    let mojang_api = mojang_api.clone();
                    Box::pin(async move {
                        mojang_api.get_username_from_uuid(x).await
                    })
                }),
                cache: Cache::builder()
                    // 2 hrs
                    .time_to_live(Duration::from_secs(60 * 60 * 2))
                    .max_capacity(2048)
                    .build()
            },
            database
        }
    }

    pub async fn resolve_batch(&mut self, uuids: Vec<Uuid>) -> HashMap<Uuid, Option<String>> {
        let mut names : HashMap<Uuid, Option<String>> = HashMap::new();
        let mut set = JoinSet::new();
        for uuid in uuids {
            let db = self.database.clone();
            let future = async move {
                (uuid.clone(), db.get_username_from_uuid(uuid.clone()).await)
            };
            set.spawn(future);
        }
        let results = set.join_all().await;
        let mut missing: Vec<Uuid> = Vec::new();
        for result in results {
            match result.1 {
                Some(name) => {
                    names.insert(result.0, Some(name));
                }
                None => {
                    missing.push(result.0)
                }
            }
        }
        let api_names =
            self.loading_cache.get_batch(missing).await;
        for (key, value) in api_names {
            if let Some(v) = value {
                names.insert(key.clone(), Some(v.clone()));
            }
        }
        names
    }
}