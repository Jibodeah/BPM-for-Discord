/**
 * Main object for integrating Typhos' BetterPonymotes with Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Many much thanks to BetterDiscord, from which a lot of ideas
 * are cribbed.
 * https://github.com/Jiiks/BetterDiscordApp
 *
 * Runs all our compiled code in Discord's Electron environment
 **/
module.exports = BPM;

var path = require('path'),
    fs = require('fs'),
    bpmDir = getBpmDir(),
    self;

function getBpmDir() {
    switch(process.platform) {
        case 'win32':
            return path.join(process.env.APPDATA, 'discord', 'bpm');
        case 'darwin':
            return path.join(process.env.HOME, 'Library', 'Preferences', 'discord', 'bpm');
        case 'linux':
            return path.resolve(process.execPath,'..', 'bpm');
        default:
            return path.join('var', 'local', 'bpm');
    }
}

function BPM(mainWindow) {
    self = this;
    self.mainWindow = mainWindow;
}

BPM.prototype.init = function() {
    //self.mainWindow.webContents.openDevTools();
    var scripts = getScripts();
    self.mainWindow.webContents.on('dom-ready', function() {
        scripts.forEach(function(script) {
            self.mainWindow.webContents.executeJavaScript(script);
        });
    });
};

function readAddonFile(filename) {
    return fs.readFileSync(path.join(bpmDir, filename), 'utf-8');
}

function getCustomScripts() {
    return fs.readdirSync(path.join(bpmDir, 'custom'))
        .filter(function(filename) { return filename.endsWith('.js'); })
        .map(function(filename) { return readCustomFile(filename); });
}

function readCustomFile(filename) {
    return fs.readFileSync(path.join(bpmDir, 'custom', filename), 'utf-8');
}

function getScripts() {
    return [
        readAddonFile('bpm.js')
    /*
        readAddonFile('updates.js'),
        readAddonFile('settings.js'),
        readAddonFile('search.js'),
        readAddonFile('core.js')
    */
    ]
    .concat(getCustomScripts());
}

