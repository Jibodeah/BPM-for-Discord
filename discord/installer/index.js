/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Installer entry point
 *
 * FLAGS:
 * --ptb : Install to the PTB client
 * -p : Feed in the path to discord (Linux only)
 * POSITIONAL 1: Path to installer directory
 **/
"use strict";
var args = require('minimist')(process.argv.slice(2)),
    sourceRoot = args._[0],
    isPTB = args.ptb,
    discordRoot = args.p;

console.log(args);

if(!sourceRoot) {
    console.log('No content directory provided!');
    console.log('Installer should be called as "index.js ADDON_ROOT [--isPTB]"');
    return;
}

var paths = require('./lib/paths').getPaths(sourceRoot, isPTB, discordRoot),
    integration = require('./lib/integration'),
    addon = require('./lib/addon');

console.log('Paths results are:');
console.log(JSON.stringify(paths, null, ' '));

integration.modifyDiscord(paths);
addon.extractAddonCode(paths);

console.log('Install complete!');

