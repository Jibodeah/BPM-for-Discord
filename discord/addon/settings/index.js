'use strict';

const optionsCss = require('raw-loader!./options.css'),
    optionsHtml = require('raw-loader!./options.html');

function initOptions(target) {
    target.innerHTML = optionsHtml; 
    window.bpm_options_loaded = true;

    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(optionsCss));
    document.head.appendChild(node);    
    
    var contentLoadedEvent = new CustomEvent('bpm_options_loaded');
    window.dispatchEvent(contentLoadedEvent);

    try {
        require('./options.js')();
    } catch(e) {
        console.log(e);        
    }
}

module.exports = initOptions;

