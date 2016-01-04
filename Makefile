################################################################################
##
## This file is part of BetterPonymotes.
## Copyright (c) 2015 Typhos.
##
## This program is free software: you can redistribute it and/or modify it
## under the terms of the GNU Affero General Public License as published by
## the Free Software Foundation, either version 3 of the License, or (at your
## option) any later version.
##
## This program is distributed in the hope that it will be useful, but WITHOUT
## ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
## FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License
## for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.
##
################################################################################

# Release process:
# - Bump version, update we-updates.json
# $ make
# - Upload Chrome addon
# - Upload webext
# $ make www
# $ make sync
# - chmod 644
# $ git ci -m "Bump version to x.y"
# $ git push github master
# - Test
# - Make thread

VERSION = 66.265

# Discord release process:
# - Bump DISCORD_VERSION (format = discord-v[semantic version]-[alpha/beta/release])
# - Commit code to git
# $ make release/discord
# - Upload generated 7z to tag's release on Github, flag draft as pre-release (maybe automate in the future)
# - Smoke test release locally
# - Flag pre-release as ready, edited and good to go 
# - Notify interested parties

DISCORD_VERSION = discord-v0.5.2-beta

CONTENT_SCRIPT := \
    addon/bpm-header.js addon/bpm-utils.js addon/bpm-browser.js \
    addon/bpm-store.js addon/bpm-search.js addon/bpm-inject.js \
    addon/bpm-searchbox.js addon/bpm-frames.js addon/bpm-alttext.js \
    addon/bpm-post.js addon/bpm-reddit.js addon/bpm-global.js addon/bpm-main.js

EMOTE_DATA = emotes/*.json tags/*.json data/rules.yaml data/tags.yaml

ADDON_DATA = \
    build/bpm-resources.js build/emote-classes.css build/betterponymotes.js \
    addon/bpmotes.css addon/combiners-nsfw.css addon/extracss-pure.css addon/extracss-webkit.css \
    addon/bootstrap.css addon/options.html addon/options.css addon/options.js \
    addon/pref-setup.js

default: build/betterponymotes-$(VERSION).xpi build/webext-$(VERSION).zip build/chrome.zip build/BPM.safariextension build/export.json.bz2 build/gif-animotes.css

clean:
	rm -fr build

www: web/* build/betterponymotes-$(VERSION).xpi build/betterponymotes.update.rdf build/betterponymotes-$(VERSION)-an+fx.xpi addon/we-updates.json
	cp web/firefox-logo.png www
	cp web/chrome-logo.png www
	cp web/safari-logo.png www
	cp web/relay-logo.png www
	cp web/ponymotes-logo.png www
	sed "s/\/\*{{version}}\*\//$(VERSION)/" < web/index.html > www/index.html

	rm -f www/*.xpi

	cp build/betterponymotes-$(VERSION).xpi www/xul/betterponymotes.xpi
	cp build/betterponymotes-$(VERSION).xpi www/xul/betterponymotes-$(VERSION).xpi

	cp build/betterponymotes-$(VERSION)-an+fx.xpi www/we/betterponymotes.xpi
	cp build/betterponymotes-$(VERSION)-an+fx.xpi www/we/betterponymotes-$(VERSION)-an+fx.xpi

sync:
	chmod 644 www/* www/we/* www/xul/*
	chmod 755 www/we www/xul
	chmod 644 animotes/*
	rsync -e "ssh -p 40719" -zvLr --delete www/ lyra@ponymotes.net:/var/www/ponymotes.net/bpm
	rsync -e "ssh -p 40719" -zvLr --delete animotes/ lyra@ponymotes.net:/var/www/ponymotes.net/animotes

build/betterponymotes.js: $(CONTENT_SCRIPT)
	mkdir -p build
	cat $(CONTENT_SCRIPT) > build/betterponymotes.js

build/bpm-resources.js build/emote-classes.css: $(EMOTE_DATA)
	mkdir -p build
	./bpgen.py

build/export.json.bz2: build/export.json
	bzip2 < build/export.json > build/export.json.bz2

build/export.json: $(EMOTE_DATA)
	./bpexport.py --json build/export.json

build/gif-animotes.css: $(EMOTE_DATA)
	mkdir -p build
	./dlanimotes.py

build/betterponymotes-$(VERSION).xpi: $(ADDON_DATA) addon/fx-main.js addon/fx-install.rdf addon/fx-package.json
	mkdir -p build/firefox/data

	sed "s/\/\*{{version}}\*\//$(VERSION)/" < addon/fx-package.json > build/firefox/package.json

	cp addon/fx-main.js build/firefox/index.js

	cp build/betterponymotes.js build/firefox/data
	cp build/bpm-resources.js build/firefox/data
	cp build/bpm-resources.js build/firefox
	cp build/emote-classes.css build/firefox/data

	cp addon/bootstrap.css build/firefox/data
	cp addon/bpmotes.css build/firefox/data
	cp addon/combiners-nsfw.css build/firefox/data
	cp addon/extracss-pure.css build/firefox/data
	cp addon/extracss-webkit.css build/firefox/data
	cp addon/options.css build/firefox/data
	cp addon/options.html build/firefox/data
	cp addon/options.js build/firefox/data
	cp addon/pref-setup.js build/firefox

	cd build/firefox && ../../node_modules/.bin/jpm xpi
	./mungexpi.py $(VERSION) addon/fx-install.rdf build/firefox/*.xpi build/betterponymotes-$(VERSION).xpi

build/betterponymotes.update.rdf: build/betterponymotes-$(VERSION).xpi
	uhura -k betterponymotes.pem build/betterponymotes-$(VERSION).xpi https://ponymotes.net/bpm/xul/betterponymotes-$(VERSION).xpi > build/betterponymotes.update.rdf

build/webext-$(VERSION).zip: $(ADDON_DATA) addon/cr-background.html addon/cr-background.js addon/we-manifest.json
	mkdir -p build/webext

	sed "s/\/\*{{version}}\*\//$(VERSION)/" < addon/we-manifest.json > build/webext/manifest.json

	cp addon/cr-background.html build/webext/background.html
	cp addon/cr-background.js build/webext/background.js

	cp build/betterponymotes.js build/webext
	cp build/bpm-resources.js build/webext
	cp build/emote-classes.css build/webext

	cp addon/bootstrap.css build/webext
	cp addon/bpmotes.css build/webext
	cp addon/combiners-nsfw.css build/webext
	cp addon/extracss-pure.css build/webext
	cp addon/extracss-webkit.css build/webext
	cp addon/options.css build/webext
	cp addon/options.html build/webext
	cp addon/options.js build/webext
	cp addon/pref-setup.js build/webext

	cd build/webext && zip ../webext-$(VERSION).zip *

build/chrome.zip: $(ADDON_DATA) addon/cr-background.html addon/cr-background.js addon/cr-manifest.json
	mkdir -p build/chrome

	sed "s/\/\*{{version}}\*\//$(VERSION)/" < addon/cr-manifest.json > build/chrome/manifest.json

	cp addon/cr-background.html build/chrome/background.html
	cp addon/cr-background.js build/chrome/background.js

	cp build/betterponymotes.js build/chrome
	cp build/bpm-resources.js build/chrome
	cp build/emote-classes.css build/chrome

	cp addon/bootstrap.css build/chrome
	cp addon/bpmotes.css build/chrome
	cp addon/combiners-nsfw.css build/chrome
	cp addon/extracss-pure.css build/chrome
	cp addon/extracss-webkit.css build/chrome
	cp addon/options.css build/chrome
	cp addon/options.html build/chrome
	cp addon/options.js build/chrome
	cp addon/pref-setup.js build/chrome

	cp betterponymotes.pem build/chrome/key.pem
	# Uncompressed due to prior difficulties with the webstore
	cd build/chrome && zip -0 ../chrome.zip *

build/BPM.safariextension: $(ADDON_DATA) addon/sf-Settings.plist addon/sf-background.html addon/sf-background.js
	mkdir -p build/BPM.safariextension

	sed "s/\/\*{{version}}\*\//$(VERSION)/" < addon/sf-Info.plist > build/BPM.safariextension/Info.plist

	cp addon/icons/sf-Icon-128.png build/BPM.safariextension/Icon-128.png
	cp addon/icons/sf-Icon-64.png build/BPM.safariextension/Icon-64.png
	cp addon/sf-background.html build/BPM.safariextension/background.html
	cp addon/sf-background.js build/BPM.safariextension/background.js
	cp addon/sf-Settings.plist build/BPM.safariextension/Settings.plist

	cp build/betterponymotes.js build/BPM.safariextension
	cp build/bpm-resources.js build/BPM.safariextension
	cp build/emote-classes.css build/BPM.safariextension

	cp addon/bootstrap.css build/BPM.safariextension
	cp addon/bpmotes.css build/BPM.safariextension
	cp addon/combiners-nsfw.css build/BPM.safariextension
	cp addon/extracss-pure.css build/BPM.safariextension
	cp addon/extracss-webkit.css build/BPM.safariextension
	cp addon/options.css build/BPM.safariextension
	cp addon/options.html build/BPM.safariextension
	cp addon/options.js build/BPM.safariextension
	cp addon/pref-setup.js build/BPM.safariextension

	cd build/BPM.safariextension && zip ../BPM.safariextension.zip *

#Set via environment variable
#DC_BPM_ARCHIVE_PASSWORD= 

DISCORD_ADDITONAL_DATA := \
	discord/addon/background.js discord/addon/settings.js discord/addon/settings.css \
	discord/addon/emote-settings.html discord/addon/general-settings.html discord/addon/search-settings.html \
	discord/addon/settings-wrapper.html discord/addon/subreddit-settings.html discord/addon/about.html \
	discord/addon/updates.html discord/addon/search.css discord/addon/search-button.js

DISCORD_SETTINGS_SCRIPT := \
	discord/addon/utils.js discord/addon/emote-settings.js discord/addon/general-settings.js \
	discord/addon/subreddit-settings.js discord/addon/search-settings.js discord/addon/updates.js \
    discord/addon/settings.js

DISCORD_INSTALLER := \
    discord/installer/constants.js discord/installer/index.js discord/installer/package.json \
    discord/installer/install_mac.command discord/installer/install_windows.bat discord/installer/win_ps.ps1 \
    discord/installer/README.md

DISCORD_INTEGRATION := \
	discord/integration/package.json discord/integration/bpm.js discord/integration/bpm-settings.js \
    discord/integration/bpm-search.js discord/integration/README.md

# Note, requires node, globally installed asar (npm install asar -g)
build/discord/installer: $(DISCORD_INSTALLER)
	mkdir -p build/discord
	
	for INSTALLER_FILE in $(DISCORD_INSTALLER); \
	do \
		cp $$INSTALLER_FILE build/discord/; \
	done
	
	cd build/discord && npm install

build/discord/integration.asar: $(DISCORD_INTEGRATION)
	mkdir -p build/discord
	asar pack discord/integration/ build/discord/integration.asar

build/discord/bpm.asar: $(ADDON_DATA) $(DISCORD_ADDITONAL_DATA) $(DISCORD_SETTINGS_SCRIPT)
	mkdir -p build/discord
	mkdir -p build/discord/addon
	
	cat $(DISCORD_SETTINGS_SCRIPT) > build/discord/addon/settings.js
	cp discord/addon/background.js build/discord/addon/background.js
	cp discord/addon/search-button.js build/discord/addon/search-button.js
	cp discord/addon/settings-wrapper.html build/discord/addon/settings-wrapper.html
	cp discord/addon/general-settings.html build/discord/addon/general-settings.html
	cp discord/addon/emote-settings.html build/discord/addon/emote-settings.html
	cp discord/addon/subreddit-settings.html build/discord/addon/subreddit-settings.html
	cp discord/addon/search-settings.html build/discord/addon/search-settings.html
	cp discord/addon/about.html build/discord/addon/about.html
	cp discord/addon/updates.html build/discord/addon/updates.html
	
	cp discord/addon/settings.css build/discord/addon/settings.css
	cp discord/addon/search.css build/discord/addon/search.css
	
	sed -i "s/<\!-- REPLACE-WITH-DC-VERSION -->/$(DISCORD_VERSION)/g" build/discord/addon/about.html
	sed -i "s/<\!-- REPLACE-WITH-BPM-VERSION -->/$(VERSION)/g" build/discord/addon/about.html
	sed -i "s/\/\* REPLACE-WITH-DC-VERSION \*\//'$(DISCORD_VERSION)'/g" build/discord/addon/settings.js

	cp build/betterponymotes.js build/discord/addon
	cp build/bpm-resources.js build/discord/addon
	cp build/emote-classes.css build/discord/addon
	cp build/gif-animotes.css build/discord/addon
	
	cp addon/bootstrap.css build/discord/addon
	cp addon/bpmotes.css build/discord/addon
	cp addon/combiners-nsfw.css build/discord/addon
	cp addon/extracss-pure.css build/discord/addon
	cp addon/extracss-webkit.css build/discord/addon
	cp addon/options.css build/discord/addon
	cp addon/options.html build/discord/addon
	cp addon/options.js build/discord/addon
	cp addon/pref-setup.js build/discord/addon
	
	asar pack build/discord/addon/ build/discord/bpm.asar
	rm -rf build/discord/addon

discord: build/discord/installer build/discord/bpm.asar build/discord/integration.asar

#Ideally we'd also upload the 7z to the release, but that's notably more difficult than it would seem 
discord/release: discord
	#Make sure we know what we're releasing
	git status 
	git log -1 
	read -r -p "Tag with above commit as $(DISCORD_VERSION) (y/n)? " DC_RELEASE_CONFIRM;\
	if [ "$$DC_RELEASE_CONFIRM" != "y" ] && [ "$$DC_RELEASE_CONFIRM" != "Y" ]; then \
		exit 1; \
	fi
	#Push a tag to git
	git tag -a "$(DISCORD_VERSION)" -m "Release of discord version $(DISCORD_VERSION)" 
	git push origin $(DISCORD_VERSION) 
	
	#Create a 7z archive
	rm -rf ./build/BPM\ for\ Discord\ $(DISCORD_VERSION).7z
	7z a ./build/BPM\ for\ Discord\ $(DISCORD_VERSION).7z -r ./build/discord/*
	
	#I'm leaving the password-protected code here just in case
	#Mac doesn't have a good 7z client that handles password protected so we create a zip.
	#rm -rf ./build/BPM\ for\ Discord\ $(DISCORD_VERSION)\ MAC.zip
	#cd ./build/discord && zip -r --password $(DC_BPM_ARCHIVE_PASSWORD) ../BPM\ for\ Discord\ $(DISCORD_VERSION)\ MAC.zip . 
	#
	#Windows actually can't extract a zipped version because the built in tools don't support the long directory paths
	#that node's module tree creates.  So, we use 7z for Windows.  In other news, what the fuck, MS.
	#rm -rf ./build/BPM\ for\ Discord\ $(DISCORD_VERSION)\ WINDOWS.7z
	#7z a ./build/BPM\ for\ Discord\ $(DISCORD_VERSION)\ WINDOWS.7z -r ./build/discord/* -p$(DC_BPM_ARCHIVE_PASSWORD) -mhe 

