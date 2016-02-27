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
    backupOldCustom(paths);
    console.log('Removing previous bpm, if it exists...');
    if(fs.existsSync(paths.addonExtract)) {
        fs.removeSync(paths.addonExtract);
        console.log('Removed previous bpm!');
    }
    console.log('Extracting bpm data to discord data...');
    asar.extractAll(paths.addonSource, paths.addonExtract); 
    console.log('Done extracting bpm data');
    restoreOldCustom(paths);
}

function backupOldCustom(paths) {
    console.log('Backing up old custom scripts to ' + paths.addonCustomBackup);
    fs.ensureDirSync(paths.addonCustom); 
    fs.copySync(paths.addonCustom, paths.addonCustomBackup);
    console.log('Done backing up old custom scripts');
}

function restoreOldCustom(paths) {
    console.log('Restoring old custom scripts');
    fs.ensureDirSync(paths.addonCustomBackup);
    fs.copySync(paths.addonCustomBackup, paths.addonCustom);
    fs.removeSync(paths.addonCustomBackup);
    console.log('Restored old custom scripts to ' + paths.addonCustom);
}
