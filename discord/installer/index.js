/**
 * Typhos' BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Heavily influenced by the BetterDiscord project:
 * https://github.com/Jiiks/BetterDiscordApp
 * Dwarves on the shoulders of giants and all that.
 **/
//NOTE:  This entire file is becoming a mess and I should _really_ revisit it
"use strict";

var _ = require('lodash');
var asar = require('asar');
var fs = require('fs-extra');
var path = require('path');
var constants = require('./constants');

var os = process.platform;
var extractPath = path.join(getDiscordPath(), 'bpm_extract');
var packPath = path.join(getDiscordPath(), 'app.asar');

//I hate this and should probably include an args lib at some point
var rootPath = process.argv.length > 2 && process.argv[2] != 'isPTB' ? process.argv[2] : '.';

var addonSourcePath = path.join(rootPath, 'bpm.asar');
var integrationSourcePath = path.join(rootPath, 'integration.asar');

console.log('args are ' + JSON.stringify(process.argv, null, ' '));
console.log('path is ' + packPath);
console.log('addonpath is ' + getBpmDataPath());
console.log('datapath is ' + rootPath);

extractAddonCode();
extractApp(getDiscordPath());
addPackageDependency(extractPath);
injectBpm(getDiscordPath());
packApp(getDiscordPath());

function getDiscordPath() {
    var isPTB = process.argv.indexOf('isPTB') >= 0;
    switch(os) {
        case 'win32':
            var localDataFolder = isPTB ? 'DiscordPTB' : 'Discord';
            var discordFolder = path.join(process.env.LOCALAPPDATA, localDataFolder);
            var contents = fs.readdirSync(discordFolder);
            //Consider this carefully, we may want to fail on a new version
            var folder = _(contents)
                .filter(file => file.indexOf('app-') > -1)
                //Sort by version number, multiple app version folders can exist
                .map(dir => {
                    var version = dir.split('-')[1];
                    var splitVersion = version.split('.');
                    return {
                        name: dir,
                        major: splitVersion[0],
                        minor: splitVersion[1],
                        bugfix: splitVersion[2]
                    };
                })
                .sortBy(["major", "minor", "bugfix"])
                .reverse()    
                .first().name;
            return path.join(discordFolder, folder, 'resources'); 
        case 'darwin':
            return '/Applications/Discord.app/Contents/Resources';
        default:
            throw new Error('Unsupported OS ' + os);
    }
}

function getBpmDataPath() {
    switch(os) {
        case 'win32':
            return path.join(process.env.APPDATA, 'discord');
        case 'darwin':
            return path.join(process.env.HOME, '/Library/Preferences/discord');
        default:
            throw new Error('Unsupported OS ' + os);
    }
}

function extractApp() {
    var backupPath = packPath + '.clean';
    if(fs.existsSync(backupPath)) {
        console.log('Pre-existing app.asar.clean found, using that...');
    } else {
        console.log('Backing up old app.asar...');
        fs.copySync(packPath, backupPath);
        console.log('Old app.asar backed up to ' + backupPath);
    }
    console.log('Extracting app.asar from ' + backupPath + ' ...');
    if(fs.existsSync(extractPath)) {
        fs.removeSync(extractPath);
        console.log('Removed pre-existing app extraction');
    }
    asar.extractAll(backupPath, extractPath);
    console.log('App extraction complete!');
}

function packApp(path) {
    if(!fs.existsSync(extractPath)) {
        throw new Error('Packing without extract path, something went horribly wrong');
    }
    console.log('Packing injected asar...');
    asar.createPackage(extractPath, packPath, () => {
        console.log('Packing complete!');
        console.log('Cleaning up unpacked data...');
        fs.removeSync(extractPath);
        console.log('Cleaned up unpacked data.');
        process.exit();
    });
}

function addPackageDependency(apppath) {
    var pkgpath = path.join(apppath, 'package.json');
    console.log('Injecting package dependency...');
    var packageData = fs.readJsonSync(pkgpath);
    packageData.dependencies['dc-bpm'] = constants.bpmVersion;
    fs.outputJsonSync(pkgpath, packageData);
    console.log('Package dependency injected');

    console.log('Moving integration into node_modules...');
    asar.extractAll(integrationSourcePath, path.join(apppath, 'node_modules', 'dc-bpm'));
    console.log('Done extracting integration!');
}

function extractAddonCode() {
    console.log('Removing previous bpm, if it exists...');
    fs.mkdirpSync(getBpmDataPath());
    if(fs.existsSync(path.join(getBpmDataPath(), 'bpm'))) {
        fs.removeSync(path.join(getBpmDataPath(), 'bpm'));
        console.log('Removed previous bpm!');
    }
    console.log('Extracting bpm data to discord data...');
    asar.extractAll(addonSourcePath, path.join(getBpmDataPath(), 'bpm')); 
    console.log('Done extracting bpm data');
}

//Brittle as hell but will work for now (eventually we will replace all this when
//the API comes out anyway)
function injectBpm(apppath) {
    console.log('Injecting BPM code into index.js...');
    var indexPath = path.join(extractPath, 'app', 'index.js');
    var indexFile = fs.readFileSync(indexPath, 'utf8');
    indexFile = indexFile.replace('\'use strict\';', '\'use strict\';\n\n' + constants.requireStatement + '\n\n');
    indexFile = indexFile.replace('global.mainWindowId = mainWindow.id;', 'global.mainWindowId = mainWindow.id;\n' + constants.injectStatement + '\n');
    fs.writeFileSync(indexPath, indexFile, 'utf8');
    console.log('BPM Injected!');
}

function backupFile(file) {
   fs.copySync(file, file + '.bak'); 
}
