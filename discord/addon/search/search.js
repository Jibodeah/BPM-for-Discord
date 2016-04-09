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
    var buttonParent = document.createElement('div');
    buttonParent.className = 'help-container';


    var searchButton = document.createElement('div');
    searchButton.className = 'bpm-emote-search-button';
    buttonParent.appendChild(searchButton);
    /*
    var blankSpan = document.createElement('span');
    blankSpan.className = 'btn-help';
    searchButton.appendChild(blankSpan);
    var helpText = document.createElement('span');
    helpText.className = 'help-text';
    helpText.appendChild(document.createTextNode('Emote Search'));
    searchButton.appendChild(helpText);
    */
     
    container.appendChild(buttonParent);
}

BPM_utils.waitForElementByClass('guilds-wrapper', modifyHelpContainer);

