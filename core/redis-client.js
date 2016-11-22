/**
 * Created by qudrat on 11/17/16.
 */

var redis = require("redis")
    , config = require('../config/config.json')
    , logger = require('../utils/logger')(__filename);

/**
 * create Redis client and export
 */
var redisClient = redis.createClient({
    host: process.argv.length >= 4 ? process.argv.slice(2)[1] : config.redis.host,
    port: config.redis.port
});

redisClient.on('error', function (err) {
    logger.error('Cannot connect to Redis. Error - ', err);
});

module.exports = redisClient;
