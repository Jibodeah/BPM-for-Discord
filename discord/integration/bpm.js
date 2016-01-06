/**
 * Main object for integrating Typhos' BetterPonymotes with Discord
 * (c) 2015 ByzantineFailure
 *
 * Many much thanks to BetterDiscord, from which a lot of ideas
 * are cribbed.
 * https://github.com/Jiiks/BetterDiscordApp
 *
 * Injects our scripts and styles then triggers any submodule code
 * (e.g. settings)
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
    getScripts().forEach(function(script) {
        self.mainWindow.webContents.executeJavaScript(script);
    });
};

function readAddonFile(filename) {
    return fs.readFileSync(path.join(bpmDir, filename), 'utf-8');
}

function getScripts() {
    return [
        readAddonFile('updates.js'),
        readAddonFile('settings.js'),
        readAddonFile('search.js'),
        readAddonFile('core.js')
    ];
}

