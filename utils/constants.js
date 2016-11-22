/**
 * Created by qudrat on 11/18/16.
 */

function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("ID_LENGTH", 6);
define("SEND_MSG_INTERVAL", 500);
define("MILLION", 1000000);