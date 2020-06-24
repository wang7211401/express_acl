const Redis = require("ioredis")
const { config } = require("../config/redis_conf")

/* ////////////// Redis ////////////// */

const redis = new Redis({
  host: config.host,
  port: config.port,
})

module.exports = {
  redis,
}
