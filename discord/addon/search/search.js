/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Adds the search button to the discord UI
 **/
require('!style!css!./search.css');

var BPM_utils = require('../utils.js');

function modifyHelpContainer(container) {
    container.className += ' bpm-help-container';
    createSearchButton(container);
}

//We rely on BPM's core code to attach this listener
function createSearchButton(container) {
    var searchButton = document.createElement('div');
    searchButton.className = 'bpm-emote-search-button';
     
    container.appendChild(searchButton);
}

BPM_utils.waitForElementByClass('guilds-wrapper', modifyHelpContainer);

