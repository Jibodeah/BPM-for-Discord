/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Adds the search button to the discord UI.  The
 * listener which opens the window when the button
 * is pressed is actually added by core.js -- so,
 * we just create the button and maintain a reference
 * to the node.
 **/
require('!style!css!./search.css');

var BPM_utils = require('../utils.js'),
    searchButton;

// We rely on BPM's core code to attach this listener.
// We also store this button in a module-global scope 
// because we are bad people and cannot maintain a consistent
// reference to it otherwise.
function createSearchButton(prefs) {
    var className = prefs.searchButtonTopRight ? 'header-toolbar' : 'guilds-wrapper';
    BPM_utils.waitForElementByClass(className, function(container) {
        var elementType = prefs.searchButtonTopRight ? 'button' : 'div';
        
        searchButton = document.createElement(elementType);
        searchButton.className = 'bpm-emote-search-button' + 
            (prefs.searchButtonTopRight ? '' : ' bpm-emote-search-button-bottom-left');
        
        container.appendChild(searchButton);
        if(prefs.searchButtonTopRight) {
            listenOnAppChange();
        }
    });
}

// The elements which contain the actual header and buttons
// for the top-right search button are often removed and re-added
// by discord's React code.  So, we need to wait for and React (hehe)
// to those DOM events to re-add the button if it doesn't exist.
// This listener is SUPER-noisy and presents an unfortunate amount
// of CPU overhead, but there's no other choice unless we actually
// hook into Discord's React code somehow (we cannot do that).
function listenOnAppChange() {
    var appDiv = document.getElementsByClassName('app')[0];
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(e) {
            var headerToolbar = document.getElementsByClassName('header-toolbar')[0];
            if(!headerToolbar) {
                return;
            }
            
            var button = document.getElementsByClassName('bpm-emote-search-button')[0];
            var firstToolbarButton = headerToolbar.childNodes[0];
            if(button) {
                // Move the button to the farthest-left position if it already exists
                // and isn't already there.
                if (firstToolbarButton && firstToolbarButton !== button) {
                    headerToolbar.insertBefore(searchButton, firstToolbarButton); 
                }
                return;
            }
            
            if(!firstToolbarButton) {
                headerToolbar.appendChild(searchButton);
            } else {
                headerToolbar.insertBefore(searchButton, firstToolbarButton); 
            }
        });
    });

    observer.observe(appDiv, { childList: true, subtree: true });
}

BPM_utils.retrievePrefs(createSearchButton);

