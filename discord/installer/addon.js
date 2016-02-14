/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Code to unpack and place the BPM browser code
 **/
"use strict";
module.exports = {
    extractAddonCode: extractAddonCode    
};

var fs = require('fs-extra'),
    asar = require('asar'),
    path = require('path');

function extractAddonCode(paths) {
    console.log('Removing previous bpm, if it exists...');
    if(fs.existsSync(paths.addonExtract)) {
        fs.removeSync(paths.addonExtract);
        console.log('Removed previous bpm!');
    }
    console.log('Extracting bpm data to discord data...');
    asar.extractAll(paths.addonSource, paths.addonExtract); 
    console.log('Done extracting bpm data');
}

