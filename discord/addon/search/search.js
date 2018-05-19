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
require('!style-loader!css-loader!./search.css');

var BPM_utils = require('../utils.js'),
    TOP_RIGHT_QUERY_SELECTOR = '[class*=title-] > [class*=flex-]',
    BOTTOM_LEFT_QUERY_SELECTOR = '.guilds-wrapper',
    searchButton;

// We rely on BPM's core code to attach this listener.
// We also store this button in a module-global scope 
// because we are bad people and cannot maintain a consistent
// reference to it otherwise.
function createSearchButton(prefs) {
    var querySelector = prefs.searchButtonTopRight ? TOP_RIGHT_QUERY_SELECTOR : BOTTOM_LEFT_QUERY_SELECTOR;
    BPM_utils.waitByQuerySelector(querySelector, function(container) {
        var elementType = prefs.searchButtonTopRight ? 'button' : 'div';
        searchButton = document.createElement(elementType);
        searchButton.className = 'bpm-emote-search-button' + 
            (prefs.searchButtonTopRight ? '' : ' bpm-emote-search-button-bottom-left');
        console.log('added search button');
        
        container.appendChild(searchButton);
        if(prefs.searchButtonTopRight) {
            console.log('prefs found');
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
    console.log('Listening on app change');
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(e) {
            var headerToolbar = document.querySelector(TOP_RIGHT_QUERY_SELECTOR);
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


/* React doesn't know about our search input, which means if we start
 * typing after having the chat input focused, the global listener
 * catches our keydown before the event's default action can happen.
 * This results in the chat input being focused and getting our keypress
 * rather than the emote searchbox.  For more details, see:
 * https://github.com/ByzantineFailure/BPM-for-Discord/issues/99
 */ 
BPM_utils.waitForElementById('bpm-sb-input', (searchInput) => {
  searchInput.addEventListener('keydown', (event) => {
    if (event.target !== searchInput) {
      return;
    }
    event.stopPropagation();
  });
});

BPM_utils.retrievePrefs(createSearchButton);

