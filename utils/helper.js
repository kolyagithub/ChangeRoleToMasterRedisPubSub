/**
 * Created by qudrat on 11/18/16.
 */

const constants = require('./constants');

/**
 * Helpers
 */
module.exports = {

    // <editor-fold desc="generate app ID">
    generateId: function () {
        return Math.round(Math.random().toFixed(constants.ID_LENGTH) * Math.pow(10, constants.ID_LENGTH));
    }
    // </editor-fold>
};

