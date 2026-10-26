const NodeCache = require('node-cache');

const CACHE_TTL_SECONDS = 60;
const cache = new NodeCache({
  stdTTL: CACHE_TTL_SECONDS,
  checkperiod: CACHE_TTL_SECONDS
});

const allTasksCacheKey = (userId) => `tasks:user:${userId}:all`;
const singleTaskCacheKey = (userId, taskId) => `tasks:user:${userId}:task:${taskId}`;

const invalidateUserTaskCache = (userId, taskId) => {
  cache.del(allTasksCacheKey(userId));
  if (taskId) cache.del(singleTaskCacheKey(userId, taskId));
};

module.exports = {
  CACHE_TTL_SECONDS,
  allTasksCacheKey,
  cache,
  invalidateUserTaskCache,
  singleTaskCacheKey
};
