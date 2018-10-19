// BetterDiscord pls.
try {
    window.localStorage = bdPluginStorage;
} catch (e) {
    // Non-BD localStorage shim
    if(window.localStorage === undefined) {
        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        window.localStorage = iframe.contentWindow.localStorage;
    }
}

// require('./updates/updates.js');
//require('./settings/settings.js');
require('./core/core.js');
require('./search/search.js');

