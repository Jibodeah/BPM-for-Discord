/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Code which opens up Discord and injects the dependency
 * and call to BPM's code.
 **/
"use strict";
var fs = require('fs-extra'),
    asar = require('asar'),
    path = require('path'),
    constants = require('./constants');

module.exports = {
    modifyDiscord: modifyDiscord
};

function modifyDiscord(paths) {
    backupCleanDiscord(paths);
    extractApp(paths);
    addPackageDependency(paths);
    injectBpm(paths);
    packApp(paths);
}

function backupCleanDiscord(paths) {
    if(fs.existsSync(paths.discordBackup)) {
        console.log('Pre-existing app.asar.clean found, using that...');
    } else {
        console.log('Backing up old app.asar...');
        fs.copySync(paths.discordPack, paths.discordBackup);
        console.log('Old app.asar backed up to ' + paths.discordBackup);
    }
}

function extractApp(paths) {
    console.log('Extracting app.asar from ' + paths.discordBackup + ' ...');
    if(fs.existsSync(paths.discordExtract)) {
        fs.removeSync(paths.discordExtract);
        console.log('Removed pre-existing app extraction');
    }
    asar.extractAll(paths.discordBackup, paths.discordExtract);
    console.log('App extraction complete!');
}

function packApp(paths) {
    if(!fs.existsSync(paths.discordExtract)) {
        throw new Error('Packing without extract path, something went horribly wrong');
    }
    console.log('Packing injected asar...');
    asar.createPackage(paths.discordExtract, paths.discordPack, () => {
        console.log('Packing complete!');
        console.log('Cleaning up unpacked data...');
        fs.removeSync(paths.discordExtract);
        console.log('Cleaned up unpacked data.');
        process.exit();
    });
}

function addPackageDependency(paths) {
    var pkgpath = path.join(paths.discordExtract, 'package.json');
    console.log('Injecting package dependency...');
    var packageData = fs.readJsonSync(pkgpath);
    packageData.dependencies['dc-bpm'] = constants.bpmVersion;
    fs.outputJsonSync(pkgpath, packageData);
    console.log('Package dependency injected');

    console.log('Moving integration into node_modules...');
    asar.extractAll(paths.integrationSource, path.join(paths.discordExtract, 'node_modules', 'dc-bpm'));
    console.log('Done extracting integration!');
}

//Brittle as hell but will work for now (eventually we will replace all this when
//the API comes out anyway)
function injectBpm(paths) {
    console.log('Injecting BPM code into index.js...');
    
    var indexPath = getIndexPath(paths),
        indexFile = fs.readFileSync(indexPath, 'utf8');

    indexFile = indexFile.replace('\'use strict\';', '\'use strict\';\n\n' + constants.requireStatement + '\n\n');
    indexFile = indexFile.replace(constants.injectLookFor, constants.injectLookFor + '\n' + constants.injectStatement + '\n');
    fs.writeFileSync(indexPath, indexFile, 'utf8');
    console.log('BPM Injected!');
}

//TODO: Discord is changing their internal structure, so this is a temp fix to hold
//us over until the mainline gets this change from the PTB
function getIndexPath(paths) {
    var indexPath = path.join(paths.discordExtract, 'app', 'index.js');
    try {
        fs.statSync(indexPath);
        return indexPath
    } catch(e) {
        if(e.code === 'ENOENT') {
            return path.join(paths.discordExtract, 'index.js');
        }
        throw e;
    }
}

