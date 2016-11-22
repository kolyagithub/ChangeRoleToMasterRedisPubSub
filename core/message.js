/**
 * Created by qudrat on 11/18/16.
 */

var constants = require('../utils/constants')
    , redisUse = require('./redisUse')
    , cmd = require('./cmd')
    , redisPubSub = require('./redispubsub')
    , _ = require('underscore')._;

/**
 * class Message
 * @constructor
 * set message by default
 * set start time (for test million receive message)
 */
function Message() {
    this._message = 0;
    this._message = 0;
    this.startTime = new Date();
}
/**
 * function 'generateMsg'
 * - generating message
 * @returns {number}
 */
Message.prototype.generateMsg = function () {
    var self = this;
    return self._message++;
};
/**
 * function 'sendMessage'
 * - get random received app and send message with interval
 */
Message.prototype.sendMessage = function () {
    var self = this;
    var sendFunc = setInterval(function () {
        redisUse.getAppIds(function (err, appIds) {
            if (err) {
                clearInterval(sendFunc);
            }
            // generate message
            var msg = self.generateMsg();
            var someAppId = _.sample(appIds) || 0;
            redisPubSub.publish(someAppId + 'new_message', msg);
        })
    }, constants.SEND_MSG_INTERVAL);
};

/**
 * function 'messageHandler'
 * - handler received message
 * @param msg - received message
 * @param appId - current app
 */
Message.prototype.messageHandler = function (msg, appId) {
    function onComplete() {
        var error = Math.random() > 0.85;
        if (error) {
            cmd.getErrors(appId);
            redisUse.addErrMessages(msg);
        }
        else {
            redisUse.checkMillionTest(function (err, isHasTestMillion) {
                if(!isHasTestMillion) {
                    redisUse.addMessages(msg, appId);
                }
            });
        }
    }
    setTimeout(onComplete, Math.floor(Math.random() * 1000));
};

/**
 * function 'getStartTime'
 * @returns {Date}
 */
Message.prototype.getStartTime = function () {
    return this.startTime;
};
module.exports = new Message();