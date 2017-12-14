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
    const useDesktopCore = fileExists(paths.discordDesktopCorePath),
        installer = useDesktopCore ? new DesktopCoreInstaller(paths) 
            : new AsarInstaller(paths);

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
        if(!fs.existsSync(paths.discordDesktopCorePath)) {
            throw new Error('Cannot find path to discord!  Try running Discord (or the canary) once before installing.');
        }
        if(fs.existsSync(paths.discordDesktopCoreBackup)) {
            console.log('Pre-existing discord_desktop_core.clean found, using that...');
        } else {
            console.log('Backing up old discord_desktop_core...');
            fs.copySync(paths.discordDesktopCorePath, paths.discordDesktopCoreBackup);
            console.log('Old discord_desktop_core.zip backed up to ' + paths.discordDesktopCoreBackup);
        }
        return new Promise((res) => res());
    }

    function desktopCore_extractApp() {
        fs.removeSync(paths.discordDesktopCorePath);
        fs.copySync(paths.discordDesktopCoreBackup, paths.discordDesktopCorePath);
        return new Promise((res) => { res() });
        /*
        return new Promise((res, rej) => {
            // Check if exists?
            fs.removeSync(paths.discordDesktopCoreExtract);
            fs.mkdirSync(paths.discordDesktopCoreExtract);
            var extractor = unzip.Extract({ path: paths.discordDesktopCoreExtract });
            extractor.on('error', rej);
            extractor.on('close', res);
            console.log('Unpacking discord_desktop_core.zip.clean to ' + paths.discordDesktopCoreExtract);
            fs.createReadStream(paths.discordDesktopCoreBackup).pipe(extractor);
        });
        */
    }
    
    function desktopCore_addPackageDependency() {
        addPackageDependency(paths.discordDesktopCorePath, paths.integrationSource);
        return new Promise((res) => res());
    }

    function desktopCore_injectBpm() {
        const injectionFile = path.join(paths.discordDesktopCorePath, 'app', 'mainScreen.js');
        
        injectBpm(injectionFile);
        return new Promise((res) => res());
    }

    function desktopCore_packApp() {
        return new Promise((res) => res());
        /*
        return new Promise((res, rej) => {
            console.log('Packing injected module...');
            const archive = archiver('zip'),
                output = fs.createWriteStream(paths.discordDesktopCorePath);

            archive.on('error', rej);
            archive.on('warning', err => {
                if(err.code === 'ENOENT') {
                    console.log(err);
                }
                else {
                    rej(err);
                }
            });
            output.on('close', () => {
                console.log('Packing complete!');
                console.log('Cleaning up unpacked data...');
                fs.removeSync(paths.discordDesktopCoreExtract);
                console.log('Cleaned up unpacked data.');
                res();
            });

            archive.pipe(output);
            archive.directory(paths.discordDesktopCoreExtract, false);
            archive.finalize();
        });
        */
    }

    this.backupCleanDiscord = desktopCore_backupCleanDiscord.bind(this);
    this.extractApp = desktopCore_extractApp.bind(this);
    this.addPackageDependency = desktopCore_addPackageDependency.bind(this);
    this.injectBpm = desktopCore_injectBpm.bind(this);
    this.packApp = desktopCore_packApp.bind(this);
}

// Asar-based functionality (canary has discarded this)
function AsarInstaller(paths) {
    function asar_backupCleanDiscord() {
        if(fs.existsSync(paths.discordBackup)) {
            console.log('Pre-existing app.asar.clean found, using that...');
        } else {
            console.log('Backing up old app.asar...');
            fs.copySync(paths.discordPack, paths.discordBackup);
            console.log('Old app.asar backed up to ' + paths.discordBackup);
        }
        return new Promise((res) => res());
    }

    function asar_extractApp() {
        console.log('Extracting app.asar from ' + paths.discordBackup + ' ...');
        if(fs.existsSync(paths.discordExtract)) {
            fs.removeSync(paths.discordExtract);
            console.log('Removed pre-existing app extraction');
        }
        asar.extractAll(paths.discordBackup, paths.discordExtract);
        console.log('App extraction complete!');
        return new Promise((res) => res());
    }

    function asar_addPackageDependency() {
        addPackageDependency(paths.discordExtract, paths.integrationSource);
        return new Promise((res) => res());
    }

    function asar_injectBpm() {
        var indexPath = path.join(paths.discordExtract, 'app', 'index.js');
       
        if (!fileExists(indexPath)) {
            indexPath = path.join(paths.discordExtract, 'index.js');
        }
        
        injectBpm(indexPath);
        return new Promise((res) => res());
    }

    function asar_packApp() {
        if(!fs.existsSync(paths.discordExtract)) {
            throw new Error('Packing without extract path, something went horribly wrong');
        }
        console.log('Packing injected asar...');
        return new Promise((res, rej) => {
            asar.createPackage(paths.discordExtract, paths.discordPack, () => {
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

    this.backupCleanDiscord = asar_backupCleanDiscord.bind(this);
    this.extractApp = asar_extractApp.bind(this);
    this.addPackageDependency = asar_addPackageDependency.bind(this);
    this.injectBpm = asar_injectBpm.bind(this);
    this.packApp = asar_packApp.bind(this);
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

