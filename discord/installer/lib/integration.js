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
    unzip = require('unzip'),
    archiver = require('archiver'),
    co = require('co'),
    constants = require('./constants');

module.exports = {
    modifyDiscord: modifyDiscord
};

function modifyDiscord(paths) {
    const installer = new DesktopCoreInstaller(paths);

    // Return a promise for when we're done 
    // Just yield everything -- any of these steps may now be async
    return co(function*(){
        yield installer.backupCleanDiscord();
        yield installer.extractApp();
        yield installer.addPackageDependency();
        yield installer.injectBpm();
        yield installer.packApp();
    });
}

function DesktopCoreInstaller(paths) {
    // NEW STRATEGY:
    // Check for extracted electron module, error w/ notification to user to run the canary once before installing
    // Check for clean backup
    // Replace w/ backup if exists, else make a backup
    // Modify in place
    // Profit
    function desktopCore_backupCleanDiscord() {
        if(!fs.existsSync(paths.discordDesktopCoreAsar)) {
            throw new Error('Cannot find path to discord!  Try running Discord (or the canary) once before installing.');
        }
        if(fs.existsSync(paths.discordDesktopCoreBackup)) {
            console.log('Pre-existing core.asar.clean found, using that...');
        } else {
            console.log('Backing up old core.asar...');
            fs.copySync(paths.discordDesktopCoreAsar, paths.discordDesktopCoreBackup);
            console.log('Old core.asar backed up to ' + paths.discordDesktopCoreBackup);
        }
        return new Promise((res) => res());
    }

    function desktopCore_extractApp() {
        asar.extractAll(paths.discordDesktopCoreBackup, paths.discordExtract);
        return new Promise((res) => { res() });
    }
    
    function desktopCore_addPackageDependency() {
        addPackageDependency(paths.discordExtract, paths.integrationSource);
        return new Promise((res) => res());
    }

    function desktopCore_injectBpm() {
        const injectionFile = path.join(paths.discordExtract, 'app', 'mainScreen.js');
        
        injectBpm(injectionFile);
        return new Promise((res) => res());
    }

    function desktopCore_packApp() {
        if(!fs.existsSync(paths.discordExtract)) {
            throw new Error('Packing without extract path, something went horribly wrong');
        }
        console.log('Packing injected asar...');
        return new Promise((res, rej) => {
            asar.createPackage(paths.discordExtract, paths.discordDesktopCoreAsar, () => {
                try {
                    console.log('Packing complete!');
                    console.log('Cleaning up unpacked data...');
                    fs.removeSync(paths.discordExtract);
                    console.log('Cleaned up unpacked data.');
                    res();
                } catch (e) {
                    rej(e);
                }
            });
        });
    }

    this.backupCleanDiscord = desktopCore_backupCleanDiscord.bind(this);
    this.extractApp = desktopCore_extractApp.bind(this);
    this.addPackageDependency = desktopCore_addPackageDependency.bind(this);
    this.injectBpm = desktopCore_injectBpm.bind(this);
    this.packApp = desktopCore_packApp.bind(this);
}

function addPackageDependency(extractPath, integrationSource) {
    var pkgpath = path.join(extractPath, 'package.json');
    console.log('Injecting package dependency...');
    var packageData = fs.readJsonSync(pkgpath);
    packageData.dependencies['dc-bpm'] = constants.bpmVersion;
    fs.outputJsonSync(pkgpath, packageData);
    console.log('Package dependency injected');

    console.log('Moving integration into node_modules...');
    asar.extractAll(integrationSource, path.join(extractPath, 'node_modules', 'dc-bpm'));
    console.log('Done extracting integration!');
}

function injectBpm(injectPath) {
    console.log('Injecting BPM code into ' + injectPath);
    
    var injectFile = fs.readFileSync(injectPath, 'utf8'),
        lookFor = constants.injectLookFor;

    if(injectFile.indexOf(lookFor) < 0) {
        lookFor = constants.injectDesktopCoreLookFor;
    }

    injectFile = injectFile.replace('\'use strict\';', '\'use strict\';\n\n' + constants.requireStatement + '\n\n');
    injectFile = injectFile.replace(lookFor, lookFor + '\n' + constants.injectStatement + '\n');
    fs.writeFileSync(injectPath, injectFile, 'utf8');
    console.log('BPM Injected!');
}

function fileExists(filepath) {
    try {
        fs.statSync(filepath);
        return true;
    } catch(e) {
        if(e.code === 'ENOENT') {
            return false;
        }
        throw e;
    }
}

