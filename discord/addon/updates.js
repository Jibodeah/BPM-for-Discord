/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 * 
 * Updates panel handlers.  Version number inserted
 * during the build process (see Makefile)
 **/

var codeVersion = /* REPLACE-WITH-DC-VERSION */;
var BPM_updatesSubpanel = {
    init: null,
    teardown: null
};
function BPM_checkForUpdates(silenceIfNone) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/repos/ByzantineFailure/bpm/releases');
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4) return;
        if(xhr.status !== 200 && xhr.status !== 304) {
           alert('Error checking for updates, HTTP status: ' + xhr.status + '.  Is Github down?'); 
           return;
        }
        var response = JSON.parse(xhr.responseText);
        //TODO:  Will fail if there's no non-prereleases ready.
        //Not a problem, though, fairly isolated, doesn't break anything
        //Still should fix.
        var releaseTag = response
            .filter(function(release) {
                return !release.prerelease;
            })
            .sort(function(a, b) {
                var aDate = new Date(a.created_at);
                var bDate = new Date(b.created_at);
                if(aDate > bDate) {
                    return -1;
                } else if (bDate > aDate) {
                    return 1;
                } else {
                    return 0;
                }
            })
            [0].tag_name;
        
        if(releaseTag !== codeVersion) {
            alert('Current BPM for Discord version is ' + codeVersion + ', found version ' + releaseTag + '\n' +
                    'Link to updates can be found in the Updates panel of BPM settings.');
        } else if(!silenceIfNone) {
            alert('BPM up to date!');
        }
    }
    xhr.send(null);
}

(function() {
    function initUpdates(subpanel) {
        var updateButton = document.getElementById('bpm-check-for-updates-button');
        updateButton.addEventListener('click', function(e) {
            e.preventDefault();
            BPM_checkForUpdates(false);
        });
    }
    function teardownUpdates(subpanel) {
        var updateButton = document.getElementById('bpm-check-for-updates-button');
        updateButton.removeEventListener('click');
    }


    BPM_updatesSubpanel.init = initUpdates;
    BPM_updatesSubpanel.teardown = teardownUpdates;
})();

BPM_checkForUpdates(true);
