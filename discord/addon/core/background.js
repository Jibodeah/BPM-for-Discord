/*******************************************************************************
**
** This file is part of BPM for Discord.
** Copyright (c) 2015-2016 ByzantineFailure.
** 
** Much of this file is copy-pasted with some tweaks from BPM proper
** Copyright (c) 2012-2015 Typhos.
**
** This program is free software: you can redistribute it and/or modify it
** under the terms of the GNU Affero General Public License as published by
** the Free Software Foundation, either version 3 of the License, or (at your
** option) any later version.
**
** This program is distributed in the hope that it will be useful, but WITHOUT
** ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
** FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
** for more details.
**
** You should have received a copy of the GNU Affero General Public License
** along with this program.  If not, see <http://www.gnu.org/licenses/>.
**
*******************************************************************************/

"use strict";

var manage_prefs = require('./pref-setup').manage_prefs,
    resources = require('./bpm-resources'),
    sr_name2id = resources.sr_name2id,
    BD_PLUGIN_NAME = 'BPM_FOR_BETTERDISCORD',
    // This value is overwritten in the build process for the BD plugin
    IS_BETTER_DISCORD = false;

function bdReadValue(key) {
    return bdPluginStorage.get(BD_PLUGIN_NAME, key);
}
function bdWriteValue(key, data) {
    bdPluginStorage.set(BD_PLUGIN_NAME, key, data);
}
function bdReadJson(key) {
    var value = bdReadValue(key);
    return value === undefined ? undefined : JSON.parse(value);
}
function bdWriteJson(key, data) {
    bdWriteValue(key, JSON.stringify(data));
}

(function() {
if(!IS_BETTER_DISCORD && localStorage.prefs === undefined) {
    localStorage.prefs = "{}";
} else if (IS_BETTER_DISCORD && bdReadValue('prefs') === null) {
    bdWriteValue('prefs', '{}');
}

var pref_manager = manage_prefs(sr_name2id, {
    read_value: IS_BETTER_DISCORD ? bdReadValue : function(key) { return localStorage[key]; },
    write_value: IS_BETTER_DISCORD ? bdWriteValue : function(key, data) { localStorage[key] = data; },
    read_json: IS_BETTER_DISCORD ? bdReadJson : function(key) { return localStorage[key] === undefined ? undefined : JSON.parse(localStorage[key]); },
    write_json: IS_BETTER_DISCORD ? bdWriteJson : function(key, data) { localStorage[key] = JSON.stringify(data); },

    download_file: function(done, url, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === 4) {
                done();
                var type = request.getResponseHeader("Content-Type");
                if(request.status === 200 && type == "text/css") {
                    callback(request.responseText);
                } else {
                    console.log("BPM: ERROR: Reddit returned HTTP status " + request.status + " for " + url + " (type: " + type + ")");
                }
            }
        };
        request.open("GET", url, true);
        // Not permitted because Chrome sucks
        //request.setRequestHeader("User-Agent", "BetterPonymotes Client CSS Updater (/u/Typhos)");
        request.send();
    },

    // Chrome's setTimeout() does not appreciate a this parameter
    set_timeout: setTimeout.bind(undefined)
});

function sendBpmMessage(data) {
    var event = new CustomEvent("bpm_message");
    event.data = data;
    window.dispatchEvent(event);
}

// Content script requests
window.addEventListener("bpm_message", function(event) {
    var message = event.data;
    switch(message.method) {
        case "get_initdata":
            var reply = {"method": "initdata"};
            if(message.want["prefs"]) {
                reply.prefs = pref_manager.get();
            }
            if(message.want["customcss"]) {
                reply.emotes = pref_manager.cm.emote_cache;
                reply.css = pref_manager.cm.css_cache;
            }
            sendBpmMessage(reply);
            break;

        case "get_prefs":
            sendBpmMessage({"method": "prefs", "prefs": pref_manager.get()});
            break;

        case "get_custom_css":
            sendBpmMessage({
                "method": "custom_css",
                "css": pref_manager.cm.css_cache,
                "emotes": pref_manager.cm.emote_cache
            });
            break;

        case "set_pref":
            pref_manager.set_pref(message.pref, message.value);
            break;

        case "force_update":
            pref_manager.cm.force_update(message.subreddit);
            break;
        
        case "initdata":
        case "prefs":
        case "custom_css":
            break;

        default:
            console.log("BPM: ERROR: Unknown request from content script: '" + message.request + "'");
            break;
    }
}, false); 
})();
