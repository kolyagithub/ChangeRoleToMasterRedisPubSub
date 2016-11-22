/**
 * Created by qudrat on 11/18/16.
 */

var helper = require('../utils/helper')
    , constants = require('../utils/constants')
    , redisUse = require('./redisUse')
    , redisPubSub = require('./redispubsub')
    , _ = require('underscore')._
    , logger = require('../utils/logger')(__filename);

/**
 * class CMD
 * @constructor
 * set app master false by default
 */
function Cmd() {
    this.isMaster = false;
    this.testMillion = false;
}

/**
 * function 'usage'
 * - show helper for cmd commands
 */
Cmd.prototype.usage = function () {
    console.log('Usage: node app.js [options] \n');
    console.log('[show]          - show every message');
    console.log('[getErrors]     - show all errors current client');
    console.log('[million]       - handle 1000000 messages (when testing use one master and one worker!)');
    console.log('[redis-ip yourIpAddress]  - redis DB ip address. Example: \'./binary redis-ip 192.168.1.12\'. Use without other arguments');
    console.log('Error logs:     - ./logs\n');
};

/**
 * function 'show'
 * - show message, when cmd command have 'show' argument
 * @param msg - showing message
 */
Cmd.prototype.show = function (msg) {
    if(process.argv.length > 0 && process.argv.slice(2)[0] == 'show') {
        process.stdout.write(' ' + msg);
    }
};

/**
 * function 'million'
 * - stopping app when received million message
 * @param countMsg - count received message
 * @param appId - current app
 * @param startTime - start time received message
 */
Cmd.prototype.million = function (countMsg, appId, startTime) {
    var self = this;
    if(process.argv.length > 0 && process.argv.slice(2)[0] == 'million') {
        redisUse.setMillionTest();
    }
    if(process.argv.length > 0 && process.argv.slice(2)[0] == 'million' && parseInt(countMsg) > constants.MILLION) {
        var endTime = new Date();
        var seconds = (endTime.getTime() - startTime.getTime()) / 1000;
        process.stdout.write(' MILLION message has expired.  ' + seconds + '  seconds!\n\n');
        redisPubSub.unsubscribe(appId + "new_message");
        redisPubSub.unsubscribe(appId + "role_message");
        redisUse.delApp(appId);
        redisUse.delMillionTest();
        process.exit(0);
    }
};

/**
 * function 'delTestMillion'
 * - remove checkMillion key from Redis, if app use command 'million'
 */
Cmd.prototype.delTestMillion = function () {
    if(process.argv.length > 0 && process.argv.slice(2)[0] == 'million') {
        redisUse.delMillionTest();
    }
};

/**
 * function 'getErrors'
 * - running:
 *      - when cmd argument has 'getErrors'
 *      - when handling first error this app
 * - show in console all error from redis of all apps
 * - clear errors data from redis
 * - close app
 * @param appId - current app
 */
Cmd.prototype.getErrors = function (appId) {
    if(process.argv.length > 0 && process.argv.slice(2)[0] == 'getErrors') {
        // get all errors
        redisUse.getErrMessages(function (err, result) {
            process.stdout.write('\n\n Error messages: ' + result + '\n\n');
            redisUse.delErrMessages();
            redisPubSub.unsubscribe(appId + "new_message");
            redisPubSub.unsubscribe(appId + "role_message");
            redisUse.delApp(appId);
            process.exit(0);
        });
    }
};

module.exports = new Cmd();