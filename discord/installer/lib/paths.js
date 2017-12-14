/**
 * BPM for Discord Installer
 * (c) 2015-2016 ByzantineFailure
 *
 * Code to resolve the correct install paths
 **/
"use strict";
var fs = require('fs-extra'),
    path = require('path'),
    _ = require('lodash'),
    OS = process.platform;

module.exports = {
    getPaths: getPaths,
};

function getPaths(sourceRoot, isPTB, isCanary, discordRoot) {
    var discordPath = getDiscordPath(isPTB, isCanary, discordRoot);
    return {
        discordRoot: discordPath,
        discordDesktopCorePath: path.join(discordPath, 'discord_desktop_core'),
        discordDesktopCoreBackup: path.join(discordPath, 'discord_desktop_core.clean'),
        discordExtract: path.join(discordPath, 'bpm_extract'),
        discordPack: path.join(discordPath, 'app.asar'),
        discordBackup: path.join(discordPath, 'app.asar.clean'),
        integrationSource: path.join(sourceRoot, 'integration.asar'),
        addonSource: path.join(sourceRoot, 'bpm.js'),
        addonDirectory: path.join(getAddonExtractPath(discordRoot), 'bpm'),
        addonTarget: path.join(getAddonExtractPath(discordRoot), 'bpm', 'bpm.js'),
        addonCustom: path.join(getAddonExtractPath(discordRoot), 'bpm', 'custom'),
        addonCustomBackup: path.join(getAddonExtractPath(discordRoot), '..', 'bpm_custom.bak')
    };
}

function getAddonExtractPath(discordRoot) {
    switch(OS) {
        case 'win32':
            return path.join(process.env.APPDATA, 'discord');
        case 'darwin':
            return path.join(process.env.HOME, '/Library/Preferences/discord');
        case 'linux':
            return discordRoot;
        default:
            throw new Error('Unsupported OS ' + OS);
    }
}

function getDiscordPath(isPTB, isCanary, discordRoot) {
    switch(OS) {
        case 'win32':
            // We don't give a shit about case in windows.  For once, this is a good thing (reverse compat.)
            const localDataFolder = isPTB ? 'DiscordPTB' : isCanary ? 'DiscordCanary' : 'Discord',
                envFolder = isCanary ? process.env.APPDATA : process.env.LOCALAPPDATA,
                discordFolder = path.join(envFolder, localDataFolder),
                contents = fs.readdirSync(discordFolder);
            //Consider this carefully, we may want to fail on a new version
            const folder = _(contents)
                // Only get directories
                .filter(file => fs.statSync(path.join(discordFolder, file)).isDirectory())
                // Starts with an integer or starts with "app-".  Reverse compat.
                .filter(file => file.indexOf('app-') > -1 || parseInt(file.charAt(0)) || parseInt(file.charAt(0)) === 0)
                //Sort by version number, multiple app version folders can exist
                .map(dir => {
                    // Support starting with "app-" -- reverse compat.
                    var version = dir.includes('-') ? dir.split('-')[1] : dir;
                    var splitVersion = version.split('.');
                    return {
                        name: dir,
                        major: parseInt(splitVersion[0]),
                        minor: parseInt(splitVersion[1]),
                        bugfix: parseInt(splitVersion[2])
                    };
                })
                .sortBy(["major", "minor", "bugfix"])
                .last()
                .name;
            
            const intermediate = path.join(discordFolder, folder),
                useModules = fs.existsSync(path.join(intermediate, 'modules')),
                finalDir = useModules ? 'modules' : 'resources';

            return path.join(discordFolder, folder, finalDir); 
        // TODO:  Make this shit work for linux/mac
        case 'darwin':
            return '/Applications/Discord' + (isPTB ? ' PTB' : '') + '.app/Contents/Resources';
        case 'linux':
            return path.join(discordRoot, 'resources');
        default:
            throw new Error('Unsupported OS ' + OS);
    }
}

