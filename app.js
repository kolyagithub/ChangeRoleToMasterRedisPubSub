/**
 * Created by qudrat on 11/17/16.
 */

var fs = require('fs');
var client = require('./core/client');
var cmd = require('./core/cmd');

/**
 * starting client
 */
client.start();

/**
 * show usage help
 */
cmd.usage();

/**
 * process before closing app
 */
process.on('SIGINT', function () {
    client.sigint();
});

/**
 * create logs folder if not exists
 */
if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
}