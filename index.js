module.exports = function (redisClient) {
  redisClient.acquireLock = async function (lockName, timeout) {
    const lock = {
      name: lockName,
      value: Math.random()
    }
    return new Promise((resolve, reject) => {
      redisClient.eval('return redis.call("set", KEYS[1], ARGV[1], "NX", "PX", ARGV[2])', 1, lock.name, lock.value, timeout,
        err => {
          if (err) {
            reject(new Error('acquire lock fail'))
          }
          resolve(lock)
        })
    })
  }

  redisClient.releaseLock = async function (lock) {
    return new Promise((resolve, reject) => {
      redisClient.eval('if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end', 1, lock.name, lock.value,
        err => {
          if (err) {
            reject(new Error('release lock fail'))
          }
          resolve()
        })
    })
  }
}
