/**
 * Created by qudrat on 11/18/16.
 */

const redis = require("./redis-client")
    , logger = require('../utils/logger')(__filename)
    , _ = require('underscore')._;

/**
 * functions for use redis DB
 */
module.exports = {

    // <editor-fold desc="Manage run apps">
    checkIsMaster: function (appId, cb) {
        redis.hgetall('apps', function (err, app) {
            if(err) {
                logger.error('Error in check apps! err: ', err);
                return cb(err, null);
            }
            var _find = false;
            _.find(app, function (value, appId) {
                var arr = JSON.parse(value);
                if (arr[0].isMaster == true) {
                    cb(null, false);
                    _find = true;
                    return true;
                }
            });
            if (_find)
                redis.hset('apps', appId, JSON.stringify([{
                    "isMaster": false,
                    "message": []
                }]));
            else {
                cb(null, true);
                redis.hset('apps', appId, JSON.stringify([{
                    "isMaster": true,
                    "message": []
                }]));
            }
        });
    },

    changeToMaster: function (appId) {
        redis.hexists('apps', appId, function (err, isHas) {
            if(err) {
                console.error('Error in changeToMaster()! err: ', err);
            }
            if (isHas) {
                redis.hget('apps', appId, function (err, rep) {
                    var arr = JSON.parse(rep);
                    arr[0].isMaster = true;
                    redis.hset('apps', appId, JSON.stringify(arr));
                });
            }
        });
    },

    addMessages: function (message, appId) {
        redis.hexists('apps', appId, function (err, isHas) {
            if(err) {
                console.error('Error in addMessages()! err: ', err);
            }
            if (isHas) {
                redis.hget('apps', appId, function (err, rep) {
                    var arr = JSON.parse(rep);
                    arr[0].message.push(message);
                    redis.hset('apps', appId, JSON.stringify(arr));
                });
            }
        });
    },

    getAppIds: function (cb) {
        var appIds = [];
        redis.hgetall('apps', function (err, app) {
            if(err) {
                logger.error('Error in get app Ids! err: ', err);
                return cb(err, null);
            }
            _.each(app, function (value, appId) {
                var arr = JSON.parse(value);
                if (arr[0].isMaster == false) {
                    appIds.push(appId);
                }
            });
            cb(null, appIds);
        });
    },

    delApp: function (appId) {
        redis.hdel(['apps', appId]);
    },
    // </editor-fold>

    // <editor-fold desc="Manage messages">
    getAllMessages: function (cb) {
        var messages = [];
        redis.hgetall('apps', function (err, app) {
            if(err) {
                logger.error('Error in get messages! err: ', err);
                return cb(err, null);
            }
            _.each(app, function (value, appId) {
                var arr = JSON.parse(value);
                messages.push(arr[0].message);
            });
            cb(null, messages);
        });
    },
    // </editor-fold>

    // <editor-fold desc="Manage error messages">
    addErrMessages: function (errMsg) {
        redis.rpush(['errors', errMsg], function(err, result) {
            if(err) {
                logger.error('Error in add error messages! err: ', err);
            }
        });
    },

    getErrMessages: function (cb) {
        redis.lrange('errors', 0, -1, function(err, reply) {
            if(err) {
                logger.error('Error in get error messages! err: ', err);
                return cb(err, null);
            }
            //var result = JSON.parse(reply);
            cb(null, reply);
        });
    },

    delErrMessages: function () {
        redis.del('errors');
    },
    // </editor-fold>

    // <editor-fold desc="Manage check argument MILLION RECEIVED">
    setMillionTest: function () {
        redis.set('checkMillion', true);
    },

    checkMillionTest: function (cb) {
        redis.exists('checkMillion', function (err, reply) {
            if(err) {
                logger.error('Error in exists check million test redis key! err: ', err);
                return cb(err, null);
            }
            if(reply) return cb(null, true);
            cb(null, false)
        });
    },

    delMillionTest: function () {
        redis.del('checkMillion');
    }
    // </editor-fold>
};

