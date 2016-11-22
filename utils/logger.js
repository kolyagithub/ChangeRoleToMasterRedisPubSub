/**
 * Created by qudrat on 11/17/16.
 */

const _ = require('underscore')._
    , winston = require('winston')
    , fs = require('fs')
    , path = require('path');

/**
 * Logger functions
 * - log by showing file name
 * - log by rotate day
 */
var baseDir = path.resolve(__dirname, '..');
const Rotate = require('winston-daily-rotate-file');
var container = new winston.Container();
var keys = [];
var twoDigit = '2-digit';
var options = {
    day: twoDigit,
    month: twoDigit,
    year: twoDigit,
    hour: twoDigit,
    minute: twoDigit,
    second: twoDigit
};
function formatter(args) {
    var dateTimeComponents = new Date().toLocaleTimeString('en-us', options).split(',');
    return dateTimeComponents[0] + dateTimeComponents[1] + ' - ' + args.level + ':    ' + args.label + '    ' + args.message;
}
function timeFormat() {
    var dateTimeComponents = new Date().toLocaleTimeString('en-us', options).split(',');
    return dateTimeComponents[0] + dateTimeComponents[1];
}

module.exports = function (filename) {
    var label = path.relative(baseDir, filename);
    if (!_.contains(keys, label)) {
        container.add("exception", {
            transports: [
                new (winston.transports.Console)({
                    handleExceptions: true,
                    label: "EXCEPTION",
                    colorize: true,
                    prettyPrint: true,
                    timestamp: timeFormat
                }),
                new (Rotate)({
                    datePattern: 'dd-MM-yyyy.log',
                    level: 'error',
                    filename: './logs/file_',
                    json: false,
                    maxsize: 1000000, // ~1 Mb
                    maxFiles: 10,
                    handleExceptions: true,
                    label: label,
                    formatter: formatter,
                    zippedArchive: true
                })
            ]
        });
        container.get("exception").exitOnError = false;
        container.add(label, {
            transports: [
                new (Rotate)({
                    datePattern: 'dd-MM-yyyy.log',
                    level: 'error',
                    filename: './logs/file_',
                    json: false,
                    timestamp: timeFormat,
                    maxsize: 1000000, // ~1 Mb
                    maxFiles: 20,
                    label: label,
                    zippedArchive: true
                }),
                new (winston.transports.Console)({
                    level: 'debug',
                    colorize: true,
                    silent: false,
                    label: label,
                    prettyPrint: true,
                    timestamp: timeFormat
                })
            ]
        });
        keys.push(label);
    }
    var logger = container.get(label);
    logger.exitOnError = false;
    return logger;
};
