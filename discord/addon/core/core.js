/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Core BPM code.  This code's requires rely on a lot of Makefile magic.
 * The dependencies are built by the BPM core build process then moved here 
 * before the webpack occurs.
 **/

var utils = require('../utils'),
    initOptions = require('../settings/index.js');

var cssMap = {};
cssMap['/emote-classes.css'] = require('raw-loader!./emote-classes.css');
cssMap['/gif-animotes.css'] = require('raw-loader!./gif-animotes.css');
cssMap['/bootstrap.css'] = require('raw-loader!./bootstrap.css');
cssMap['/bpmotes.css'] = require('raw-loader!./bpmotes.css');
cssMap['/combiners-nsfw.css'] = require('raw-loader!./combiners-nsfw.css');
cssMap['/extracss-pure.css'] = require('raw-loader!./extracss-pure.css');
cssMap['/extracss-webkit.css'] = require('raw-loader!./extracss-webkit.css');

function getChatInputTextarea() {
    var sendbox = document.querySelector('.channel-text-area-default > [class*=inner] > textarea');
    if(sendbox.length === 0) {
        return null;
    }
    else {
        return sendbox ;
    }
}

// Shennanigans to get around React's BS.  See the below link for details
// https://github.com/ByzantineFailure/BPM-for-Discord/issues/92
function updateTextarea(node, value) {
    // So, react actually puts its own `setter` for `value` on any node that's
    // part of an input for a react component.  In order to actually get state
    // changes triggered, we have to delete this setter and re-set our value.
    // We are comfortable w/ this because React doesn't make this happen in
    // safari or if a getter/setter already exists anyway.
    delete node.value;
    node.value = value;
    // Trigger an event which bubbles up to React's global event handler so we can
    // make sure we update Discord's internal State.
    const event = new Event('change', { target: node, bubbles: true, cancelable: false });
    node.dispatchEvent(event);
}

window.addEventListener('bpm_backend_message', function(event) {
    var message = event.data;
    switch(message.method) {
        case 'insert_css':
            var css = cssMap[message.file];
            var node = document.createElement('style');
            node.type = 'text/css';
            node.appendChild(document.createTextNode(css));
            document.head.appendChild(node);    
            break;
        //We may consider perhaps making this an option instead.
        case 'insert_emote':
            var chatbox = getChatInputTextarea();
            if(!chatbox) {
                console.log('Cannot add search emote "' + message.emote + '", chat textarea does not exist');
                return;
            }
            var newValue = chatbox.value + "[](" + message.emote + ")";
            updateTextarea(chatbox, newValue);
            break;
        case 'init_options':
            var target = message.target;
            initOptions(target);
            break;
        default:
            throw new Error('BPM: unrecognized discord message: ' + message.method, message);
            break;
    }
});

//Require BPM content in last
require('./bpm-resources.js');
require('./pref-setup.js');
require('./background.js');
require('./betterponymotes.js');

