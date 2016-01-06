/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Checks for updates on launch then every UPDATE_INTERVAL_HOURS
 **/
require('!style!css!./updates.css');
var BPM_updates = require('./update-functions.js');

(function() {
    var UPDATE_INTERVAL_HOURS = 3;
    function backgroundUpdateCheck() {
        BPM_updates.checkForUpdates(false);
        window.setTimeout(backgroundUpdateCheck, 1000 * 60 * 60 * UPDATE_INTERVAL_HOURS);
    }

    backgroundUpdateCheck();
})();
