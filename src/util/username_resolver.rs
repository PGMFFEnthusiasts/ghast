use crate::db::database::Database;
use crate::external::mojang::MojangApi;
use crate::util::cached_accessor::LoadingCacheDataAccessor;
use moka::future::Cache;
use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;
use uuid::Uuid;

pub struct UsernameResolver {
    #[allow(dead_code)]
    loading_cache: LoadingCacheDataAccessor<Uuid, String>,
    database: Arc<Database>,
}

impl UsernameResolver {
    pub fn create(database: Arc<Database>) -> UsernameResolver {
        let mojang_api = Arc::new(MojangApi::new());
        UsernameResolver {
            loading_cache: LoadingCacheDataAccessor {
                // loader: Arc::new(move |x| Box::pin(mojang_api.get_username_from_uuid(x))),
                loader: Arc::new(move |x| {
                    let mojang_api = mojang_api.clone();
                    Box::pin(async move { mojang_api.get_username_from_uuid(x).await })
                }),
                cache: Cache::builder()
                    // 2 hrs
                    .time_to_live(Duration::from_secs(60 * 60 * 2))
                    .max_capacity(2048)
                    .build(),
            },
            database,
        }
    }

    pub async fn resolve_batch(&mut self, uuids: Vec<Uuid>) -> HashMap<Uuid, Option<String>> {
        let mut names: HashMap<Uuid, Option<String>> = HashMap::new();

        let mut results = {
            let db = self.database.clone();
            db.get_usernames_from_uuids(&uuids).await
        };

        for uuid in uuids {
            names.insert(uuid, results.remove(&uuid));
        }

        // no one wants this
        // let api_names = self.loading_cache.get_batch(
        //     Vec::from_iter(missing.iter().cloned())
        // ).await;
        // for (key, value) in api_names {
        //     if let Some(v) = value {
        //         names.insert(key, Some(v.clone()));
        //     }
        // }
        names
    }
}
