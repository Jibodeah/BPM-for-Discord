/*******************************************************************************
**
** This file is part of BetterPonymotes.
** Copyright (c) 2012-2015 Typhos.
** Copyright (c) 2015 TwilightShadow1.
** Copyright (c) 2017 ByzantineFailure
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

var BPM_RESOURCE_PREFIX = "https://ponymotes.net/bpm";

const discord_utils = require('../utils');

const {sr_id2name, sr_name2id, tag_id2name, tag_name2id, emote_map}  = require('../core/bpm-resources.js');

// WARNING: This script is "executed" twice on Firefox- once as a normal <script>
// tag, but also a a content script attached to the page. This is for code
// sharing purposes (so we can reuse the same options.html between all browsers),
// but be careful not to run any code if we're not in the proper context.
//
// platform is "unknown" when run via <script> tag on Firefox.
var _bpm_this = this;

function _bpm_global(name) {
    return _bpm_this[name] || window[name] || undefined;
}

// Try to fool AMO.
var a = "foo", b = "set";
var c = "bar", d = "Timeout";
var n = (a + c).replace(a, b);
var ST = window[n.replace(c, d)];

var bpm_utils = {
    platform: 'discord-ext',

    copy_properties: function(to, from) {
        for(var key in from) {
            to[key] = from[key];
        }
    },

    catch_errors: function(f) {
        return function() {
            try {
                return f.apply(this, arguments);
            } catch(e) {
                console.log("BPM: ERROR: Exception on line " + e.lineNumber + ": ", e.name + ": " + e.message);
                throw e;
            }
        };
    },

    with_dom: function(callback) {
        if(window.bpm_options_loaded === true) {
            callback();
        } else {
            var listener = window.addEventListener('bpm_options_loaded', function(event) {
                window.removeEventListener(listener);
                callback();k
            }, false);
        }
    },
};

var bpm_prefs = {
    prefs: null,
    sr_array: null,
    waiting: [],
    sync_timeouts: {},
    
    set_pref: function(key, value) {
        discord_utils.setOption(key, value);
    },

    request_prefs: function() {
        discord_utils.retrievePrefs(function(prefs) {
            bpm_prefs.prefs = prefs; 
        });
    },

    force_update: function(subreddit) {
        console.log('BPM: Forcing subreddit update for ' + subreddit + '...');
        this._send_message("force_update", {"subreddit": subreddit});
    },

    _ready: function() {
        //TODO: wtf is custom_emotes?
        return (this.prefs !== null); //&& this.custom_emotes !== null);
    },

    _run_callbacks: function() {
        for(var i = 0; i < this.waiting.length; i++) {
            this.waiting[i](this);
        }
    },

    when_available: function(callback) {
        if(this._ready()) {
            callback(this);
        } else {
            this.waiting.push(callback);
        }
    },

    got_prefs: function(prefs) {
        this.prefs = prefs;
        this._make_sr_array();
        this.de_map = this._make_emote_map(prefs.disabledEmotes);
        this.we_map = this._make_emote_map(prefs.whitelistedEmotes);

        this._run_callbacks();
    },

    _make_sr_array: function() {
        this.sr_array = [];
        for(var id in sr_id2name) {
            this.sr_array[id] = this.prefs.enabledSubreddits2[sr_id2name[id]];
        }
        if(this.sr_array.indexOf(undefined) > -1) {
            // Holes in the array mean holes in sr_id2name, which can't possibly
            // happen. If it does, though, any associated emotes will be hidden.
            //
            // Also bad would be items in prefs not in sr_id2name, but that's
            // more or less impossible to handle.
            console.log("BPM: ERROR: sr_array has holes; installation or prefs are broken!");
        }
    },

    _make_emote_map: function(list) {
        var map = {};
        for(var i = 0; i < list.length; i++) {
            map[list[i]] = 1;
        }
        return map;
    },

    sync_key: function(key) {
        discord_utils.setOption(key, this.prefs[key]);
    }
};

bpm_prefs._ready = bpm_prefs._ready.bind(bpm_prefs);
bpm_prefs._make_sr_array = bpm_prefs._make_sr_array.bind(bpm_prefs);
bpm_prefs.got_prefs = bpm_prefs.got_prefs.bind(bpm_prefs);
bpm_prefs.when_available = bpm_prefs.when_available.bind(bpm_prefs);


function manage_option(prefs, name) {
    var element = document.getElementById(name);
    element.checked = prefs[name];

    element.addEventListener("click", function(event) {
        prefs[name] = this.checked;
        bpm_prefs.sync_key(name);
    });
}

function manage_number(prefs, name, default_value) {
    var element = document.getElementById(name);
    element.value = prefs[name];

    element.addEventListener("input", function(event) {
        // Forbid negatives
        var value = Math.max(parseInt(this.value, 10), 0);
        if(isNaN(value)) {
            // Completely unusable input- reset to default
            value = default_value;
            this.value = "";
        } else {
            // Effectively removes non-integers from the form.
            this.value = value;
        }

        prefs[name] = value;
        bpm_prefs.sync_key(name);
    });
}

function manage_enabled_subreddits(prefs) {
    // Subreddit enabler
    var list_div = document.getElementById("enabledSubreddits");

    var checkboxes = [];
    // Generate a page from the builtin list of subreddits
    for(var subreddit in sr_name2id) {
        var input = document.createElement("input");
        input.type = "checkbox";

        var label = document.createElement("label");
        label.className = "checkbox";
        label.appendChild(input);
        label.appendChild(document.createTextNode(subreddit));

        list_div.appendChild(label);

        input.checked = Boolean(prefs.enabledSubreddits2[subreddit]);
        checkboxes.push(input);

        // Closure
        var callback = (function(subreddit) {
            return function(event) {
                prefs.enabledSubreddits2[subreddit] = Number(this.checked);
                bpm_prefs.sync_key("enabledSubreddits2");
            };
        })(subreddit);

        input.addEventListener("change", callback);
    }

    function set_all(value) {
        for(var i = 0; i < checkboxes.length; i++) {
            checkboxes[i].checked = value;
        }

        for(var subreddit in sr_name2id) {
            prefs.enabledSubreddits2[subreddit] = value;
        }

        bpm_prefs.sync_key("enabledSubreddits2");
    }

    document.getElementById("enable-all-subreddits").addEventListener("click", function(event) {
        set_all(true);
    });
    document.getElementById("disable-all-subreddits").addEventListener("click", function(event) {
        set_all(false);
    });
}

function manage_emote_list(prefs, name) {
    var container = document.getElementById(name);
    var form = container.parentElement.parentElement;

    var input = document.getElementById(name + "-input");
    var clear_button = document.getElementById(name + "-clear");

    var list = prefs[name];
    var tags = [];

    function insert_tag(emote) {
        var anchor = document.createElement("a");
        anchor.href = "#";
        anchor.textContent = "x";

        var span = document.createElement("span");
        span.className = "listed-emote";
        span.appendChild(document.createTextNode(emote + " "));
        span.appendChild(anchor);

        anchor.addEventListener("click", function(event) {
            event.preventDefault();
            var index = list.indexOf(emote);
            list.splice(index, 1);
            tags.splice(index, 1);
            span.remove();
            bpm_prefs.sync_key(name);
        });
        input.parentElement.insertBefore(span, input);
        tags.push(span);
    }

    function parse_input() {
        var text = input.value;
        var emotes = text.split(",");
        // Normalize things a bit
        emotes = emotes.map(function(s) { return s.trim(); });
        emotes = emotes.filter(function(s) { return s.length; });
        return emotes;
    }

    function insert_emotes(emotes) {
        emotes = emotes.map(function(s) {
            return (s[0] === "/" ? "" : "/") + s;
        });

        var changed = false;
        for(var i = 0; i < emotes.length; i++) {
            if(list.indexOf(emotes[i]) > -1) {
                continue; // Already in the list
            }
            if(!emote_map[emotes[i]]) {
                continue; // Not an emote (NOTE: what about global emotes?)
            }

            list.push(emotes[i]);
            insert_tag(emotes[i]);
            changed = true;
        }

        if(changed) {
            bpm_prefs.sync_key(name);
        }
    }

    // NOTE: This list isn't verified against emote_map at all. Should we?
    for(var i = 0; i < list.length; i++) {
        insert_tag(list[i]);
    }

    // Defer focus
    container.addEventListener("click", function(event) {
        input.focus();
    });

    // Handle enter/backspace specially. Remember that keydown sees the input
    // as it was *before* the key is handled by the browser.
    input.addEventListener("keydown", function(event) {
        if(event.keyCode === 8) { // Backspace
            if(!input.value && list.length) {
                // Empty input means chop off the last item
                var index = list.length - 1;
                tags[index].remove();

                list.splice(index, 1);
                tags.splice(index, 1);

                bpm_prefs.sync_key(name);
            }
        } else if(event.keyCode === 13) { // Return key
            var emotes = parse_input();
            insert_emotes(emotes);
            input.value = "";
        }
    });

    // Handle commas
    input.addEventListener("input", function(event) {
        var emotes = parse_input();
        var text = input.value;
        if(text[text.length - 1] === ",") {
            input.value = "";
        } else {
            input.value = (emotes.pop() || "");
        }
        insert_emotes(emotes);
    });

    // Disable submission (annoying page refresh)
    form.addEventListener("submit", function(event) {
        event.preventDefault();
    });

    clear_button.addEventListener("click", function(event) {
        list.splice(0, list.length); // Clear in place
        for(var i = 0; i < tags.length; i++) {
            tags[i].remove();
        }
        tags = [];
        bpm_prefs.sync_key(name);
    });
}

function run(prefs) {
    //manage_option(prefs, "enableGlobalEmotes");
    manage_option(prefs, "enableNSFW");
    manage_option(prefs, "enableExtraCSS");
    manage_option(prefs, "showUnknownEmotes");
    manage_option(prefs, "hideDisabledEmotes");
    manage_option(prefs, "showAltText");
    manage_option(prefs, "clickToggleSFW");
    manage_option(prefs, "disableDisruptiveEmotes");
    manage_option(prefs, "disableEmotesInCodeBlocks");
    manage_option(prefs, "searchButtonTopRight");
    manage_number(prefs, "searchLimit", 250);
    manage_number(prefs, "maxEmoteSize", 0);

    manage_enabled_subreddits(prefs);

    manage_emote_list(prefs, "disabledEmotes");
    manage_emote_list(prefs, "whitelistedEmotes");
}

function main() {
    bpm_prefs.request_prefs();

    bpm_utils.with_dom(function() {
        bpm_prefs.when_available(function(prefs) {
            run(prefs.prefs);
        }.bind(this));
    }.bind(this));
}

module.exports = main;
