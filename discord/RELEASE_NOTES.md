### [Download BPM for Discord](https://github.com/ByzantineFailure/BPM-for-Discord/releases/download/discord-v0.11.0-beta/BPM.for.Discord.discord-v0.11.0-beta.7z)
### [Download BetterDiscord Version](https://github.com/ByzantineFailure/BPM-for-Discord/releases/download/discord-v0.11.0-beta/betterDiscord-bpm.plugin.js)

## Changelog

** IMPORTANT: You MUST UPDATE DISCORD before you can install this update!  This is a BREAKING CHANGE that is REQUIRED to support Discord's new internals. **

** Linux users: ** Unfortunately I don't have an environment to develop for you guys :(  This install will not yet work for you and won't until I get a community contribution.  The file you'll need to play with is `lib/paths.js`.  Find the `getDiscordPath` function and modify it to point to wherever the linux version's modules are extracted to.  `discordRoot` is the value you pass in to install BPM.

* Adds support for new Discord internals structure
 * Does not yet support Linux.  Looking for community contributions here :(
* Adds canary installers for mac/windows

**IF DISCORD UPDATES YOU MAY HAVE TO REINSTALL BPM**

## [Install/Uninstall Instructions](https://github.com/ByzantineFailure/BPM-for-Discord/blob/discord-v0.11.0-beta/discord/INSTALLATION.md)

## [BetterDiscord plugin Instructions](https://github.com/ByzantineFailure/BPM-for-Discord/blob/discord-v0.11.0-beta/discord/BETTERDISCORD.md)

## [Features](https://github.com/ByzantineFailure/BPM-for-Discord/blob/discord-v0.11.0-beta/discord/FEATURES.md)

## [Adding and running custom JavaScript](https://github.com/ByzantineFailure/BPM-for-Discord/blob/discord-v0.11.0-beta/discord/CUSTOMJS.md)

## Issues
Please report [at the repo's issues page](https://github.com/ByzantineFailure/bpm/issues)

**Do not download the source code unless you plan to build this yourself, it will not work without building it.**
