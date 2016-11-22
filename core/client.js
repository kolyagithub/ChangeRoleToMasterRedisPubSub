/**
 * Created by qudrat on 11/18/16.
 */

var helper = require('../utils/helper')
    , redisUse = require('./redisUse')
    , message = require('./message')
    , cmd = require('./cmd')
    , redisPubSub = require('./redispubsub')
    , _ = require('underscore')._;

/**
 * class Client
 * @constructor
 * generate appId, set app by default worker
 */
function Client() {
    this.appId = helper.generateId();
    this.isMaster = false;
}
/**
 * function 'start'
 * - init redis Pub/Sub channels and listen
 * - check running app
 * - if master send generated message
 * - else nothing do it. Only listen channels
 * @returns {*}
 */
Client.prototype.start = function () {
    var self = this;
    redisPubSub.init(self.appId);
    redisUse.checkIsMaster(self.appId, function (err, isMaster) {
        if (isMaster) {
            console.log('Client runs as Master!');
            self.isMaster = true;
            // send to only one worker with interval 500 ms
            message.sendMessage();
        }
        else {
            console.log('Client runs as Worker!');
        }
    });
};

/**
 * function 'sigint'
 * - check app
 * - if master:
 *      - publish priority to other someone app
 *      - unsubscribed channels
 *      - clear appId from Redis
 *      - close app
 * - else
 *      - unsubscribed channels
 *      - clear appId from Redis
 *      - close app
 * @returns {*}
 */
Client.prototype.sigint = function () {
    var self = this;
    if(self.isMaster) {
        return redisUse.getAppIds(function (err, appIds) {
            var someAppId = _.sample(appIds) || 0;
            redisPubSub.publish(someAppId + "role_message", 0);
            redisPubSub.unsubscribe(self.appId + "new_message");
            redisPubSub.unsubscribe(self.appId + "role_message");
            redisUse.delApp(self.appId);
            process.exit(0);
        });
    }
    cmd.delTestMillion();
    redisPubSub.unsubscribe(self.appId + "new_message");
    redisPubSub.unsubscribe(self.appId + "role_message");
    redisUse.delApp(self.appId);
    process.exit(0);
};

/**
 * function 'changeToMaster'
 * - check app as master
 */
Client.prototype.changeToMaster = function () {
    this.isMaster = true;
};
module.exports = new Client();