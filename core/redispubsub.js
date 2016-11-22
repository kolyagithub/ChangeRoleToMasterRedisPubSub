/**
 * Created by qudrat on 11/17/16.
 */

var config = require('../config/config')
    , redisCl = require('redis')
    , redisUse = require('./redisUse')
    , client = require('./client')
    , logger = require('../utils/logger')(__filename);

/**
 * class RedisPubSub
 * @constructor
 */
function RedisPubSub() {
    this.pub = null;
    this.sub = null;
    this.countMsg = 0;
}

/**
 * function 'init'
 * - init publish and subscribe channels
 * - listen channels
 * - manage incoming channels
 * @param appId - current app
 */
RedisPubSub.prototype.init = function (appId) {
    var self = this;
    self.pub = redisCl.createClient(config.redis.port, config.redis.host);
    self.sub = redisCl.createClient(config.redis.port, config.redis.host);
    self.sub.subscribe(appId + "new_message");
    self.sub.subscribe(appId + "role_message");
    self.sub.on("message", function (channel, msg) {
        var message = require('./message'), cmd = require('./cmd'), client = require('./client');
        switch (channel) {
            case appId + "new_message":
                self.countMsg++;
                cmd.show(msg);
                cmd.million(self.countMsg, appId, message.getStartTime());
                message.messageHandler(msg, appId);
                break;
            case appId + "role_message":
                console.log('Now this app is Master!');
                redisUse.changeToMaster(appId);
                client.changeToMaster(appId);
                message.sendMessage();
                break;
        }
    });
};

/**
 * function 'unsubscribe'
 * @param channel - subscribed channel name
 */
RedisPubSub.prototype.unsubscribe = function (channel) {
    this.sub.unsubscribe(channel);
};

/**
 * function 'publish'
 * @param channel - publishing channel name
 * @param msg - message for publishing
 */
RedisPubSub.prototype.publish = function (channel, msg) {
    this.pub.publish(channel || '', JSON.stringify(msg), function (err) {
        if (err) {
            logger.error('Error in publish()');
        }
    });
};
module.exports = new RedisPubSub();
