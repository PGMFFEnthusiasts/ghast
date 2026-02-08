use moka::future::Cache;
use std::collections::HashMap;
use std::hash::Hash;
use std::pin::Pin;
use std::sync::Arc;
use tokio::task::JoinSet;

// pub trait KeyedDataAccessor<K, V> {
//     async fn get(&mut self, key: K) -> V;
// }

#[allow(dead_code, clippy::type_complexity)]
pub struct LoadingCacheDataAccessor<K, V> {
    pub loader: Arc<dyn Fn(K) -> Pin<Box<dyn Future<Output = Option<V>> + Send>> + Send + Sync>,
    pub cache: Cache<K, V>,
}
impl<K: Hash + Eq + Send + Sync + 'static + Clone, V: Clone + Send + Sync + 'static>
    LoadingCacheDataAccessor<K, V>
{
    #[allow(dead_code)]
    pub async fn get_batch(&self, keys: Vec<K>) -> HashMap<K, Option<V>> {
        let mut set = JoinSet::new();

        for key in keys {
            let loader = self.loader.clone();
            let cache = self.cache.clone();
            let future = async move {
                let value = cache.get(&key).await;
                let value = if let Some(value) = value {
                    Some(value)
                } else {
                    let value = (loader)(key.clone()).await;
                    if let Some(value) = value {
                        cache.insert(key.clone(), value.clone()).await;
                        Some(value)
                    } else {
                        None
                    }
                };
                (key.clone(), value)
            };
            set.spawn(future);
        }
        let results = set.join_all().await;
        results.into_iter().collect()
    }
}

// impl<
//     K: Hash + Eq + Send + Sync + 'static + Clone,
//     V: Clone + Send + Sync + 'static
// > KeyedDataAccessor<K, V> for LoadingCacheDataAccessor<K, V> {
//     async fn get(&mut self, key: K) -> V {
//         match self.cache.get(&key).await {
//             Some(value) => value,
//             None => {
//                 let value = (&self.loader)(key.clone()).await;
//                 self.cache.insert(key, value.clone()).await;
//                 value
//             }
//         }
//     }
// }
