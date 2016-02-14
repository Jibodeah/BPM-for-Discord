/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Installer entry point
 **/
"use strict";
var args = require('minimist')(process.argv.slice(2)),
    sourceRoot = args._[0],
    //This will fail if you call this with a sourceRoot of 
    //"isPTB".  If you are installing from a directory with
    //a path of "isPTB" you will get what you deserve.
    isPTB = args._.indexOf("isPTB") >= 0;

console.log(args);

if(!sourceRoot) {
    console.log('No content directory provided!');
    console.log('Installer should be called as "index.js ADDON_ROOT [--isPTB]"');
    return;
}

var paths = require('./paths').getPaths(sourceRoot, isPTB),
    integration = require('./integration'),
    addon = require('./addon');

console.log('Paths results are:');
console.log(JSON.stringify(paths, null, ' '));

integration.modifyDiscord(paths);
addon.extractAddonCode(paths);

console.log('Install complete!');

