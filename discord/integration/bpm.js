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

// This comes in transitively from the environment we install in.
const ipc = require('electron').ipcMain,
    emoteData = require('./emote_data.json'),
    IPC_REQUEST_NAME = 'load-bpm-emote-request',
    IPC_RESPONSE_NAME = 'load-bpm-emote-response';

var path = require('path'),
    https = require('https'),
    fs = require('fs'),
    bpmDir = getBpmDir(),
    self;

const imageCache = {},
    logLocation = path.join(getBpmDir(), 'log.log');

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
    var scripts = getScripts();
    self.mainWindow.webContents.on('dom-ready', function() {
        self.mainWindow.webContents.executeJavaScript('const bpmIpc = require(\'electron\').ipcRenderer');
        scripts.forEach(function(script) {
            self.mainWindow.webContents.executeJavaScript(script);
        });
    });
    
    // Message Format:
    // { 
    //    emoteName: string,
    //    data: string (base64),
    //    error: Error,
    // }
    ipc.on(IPC_REQUEST_NAME, (event, message) => {
        fs.appendFile(logLocation, `EMOTE_REQUEST: ${JSON.stringify(message)}\n`, () => {});
        const emoteName = message.emoteName;
        if (imageCache[emoteName]) {
            respondToEmoteRequest(event, emoteName, imageData.data, imageData.extname);
        } else {
            loadEmote(message.emoteName).then(data => {
                imageCache[emoteName] = data;
                respondToEmoteRequest(event, emoteName, data.data, data.extname);
            }).catch(err => {
                fs.appendFile(logLocation, `EMOTE_ERROR: ${JSON.stringify(err.message)}\n`, () => {});
                event.sender.send(IPC_RESPONSE_NAME, {error: err, emoteName: emoteName, data: null, extname: null});  
            });
        }
    });
};

// Response format:
// { data: base64String }
function respondToEmoteRequest(event, emoteName, imageData, extname) {
    const message = {emoteName: emoteName, data: imageData, error: null, extname: extname};
    event.sender.send(IPC_RESPONSE_NAME, message);
}

// Returns a promise with the base64-ified emote image data
function loadEmote(emoteName) {
    return new Promise((res, rej) => {
        const datum = emoteData[emoteName];
        if (!datum) {
            rej(new Error(`Emote name ${emoteName} does not correspond to a known emote`));
        }
        if (!datum.image_url) {
            rej(new Error(`Emote name ${emoteName} has no image url`));
        }
        const extname = path.extname(datum.image_url).substr(1);
        https.get(datum.image_url, response => {
          if (response.statusCode !== 200) {
              rej(new Error( `${emoteName} got non200 status code, ${response.statusCode}`));
          }

          const imageData = [];

          response.on('data', chunk => {
            imageData.push(chunk);
          });
        
          response.on('end', () => {
              const responseBuffer = Buffer.concat(imageData);
              res({ data: responseBuffer.toString('base64'), extname: extname });
          });
        }).on('error', err => {
          rej(err);
      });
    });
}

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
    ]
    .concat(getCustomScripts());
}

