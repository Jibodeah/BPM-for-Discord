/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Constants for use in the installer
 **/

"use strict";
module.exports = {
    bpmVersion: '^0.0.1',
    requireStatement: 'var bpm = require(\'dc-bpm\');',
    injectStatement: 'var bpmInstance = new bpm(mainWindow);\nbpmInstance.init();',
    injectLookFor: 'global.mainWindowId = mainWindow.id;'
};

