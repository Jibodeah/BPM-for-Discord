/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Functions for checking for updates and adding
 * update notification elements/alerts
 **/

module.exports = {
    checkForUpdates: checkForUpdates
};

var releasesUrl = 'https://api.github.com/repos/ByzantineFailure/BPM-for-Discord/releases';
var codeVersion = 'REPLACE-WITH-DC-VERSION';

function checkForUpdates(createAlert) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', releasesUrl);
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4) return;
        if(xhr.status !== 200 && xhr.status !== 304) {
            if(createAlert) {
                alert('Error checking for updates, HTTP status: ' + xhr.status + '.  Is Github down?'); 
            }
            return;
        }
        var response = JSON.parse(xhr.responseText);
        //TODO:  Will fail if there's no non-prereleases ready.
        //Not a problem, though, fairly isolated, doesn't break anything
        //Still should fix.
        var release = response
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
            [0];
        
        if(release.tag_name !== codeVersion) {
            if(createAlert) {
                alert('Current BPM for Discord version is ' + codeVersion + ', found version ' + release.tag_name + '\n' +
                        'Link to updates can be found in the Updates panel of BPM settings.');
            }
            addUpdatesNotifier(release.html_url);
        } else if(createAlert) {
            alert('BPM up to date!');
        }
    };
    xhr.send(null);
}
function addUpdatesNotifier(url) {
    var preexisting = document.getElementById('bpm-update-link');
    if(preexisting) {
        if(preexisting.href != url) {
            preexisting.href = url;
        }
        return;
    }

    var guildDiv = document.createElement('div');
    guildDiv.className = 'guild';
    
    var ginner = document.createElement('div');
    guildDiv.appendChild(ginner);
    ginner.className = 'guild-inner';
    ginner.id = 'bpm-new-version-button';

    var link = document.createElement('a');
    ginner.appendChild(link);
    link.id = 'bpm-update-link';
    link.href = url;
    link.target = '_blank';
    link.appendChild(document.createTextNode('Update'));
    
    var container = document.querySelector('div.guilds');
    container.insertBefore(guildDiv, container.firstChild);
}

