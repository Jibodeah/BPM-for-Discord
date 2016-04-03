# BPM for BetterDiscord Plugin

BPM for Discord does not reliably co-exist with [the BetterDiscord project](https://github.com/Jiiks/BetterDiscordApp)

To support this use case, I have created a version of BPM which works as a BetterDiscord plugin.

**The plugin is not be guaranteed to be reliable, and I am not actively monitoring it for issues.  If you have an issue I encourage you to file an issue on [the repo issues page](https://github.com/ByzantineFailure/BPM-for-Discord/issues) to make me aware of it.**

The Custom JS feature does not work with the BetterDiscord plugin version.  You will have to port any custom scripts you have written for BPM for Discord into BetterDiscord plugins if you would like them to work.

## Installation

If you installed BetterDiscord and BPM, you should just reinstall Discord.  If you have previously installed BPM, you will have to either re-install discord, or restore `app.asar` from `app.asar.clean`.  

Install BetterDiscord

Move the `betterDiscord-plugin.js` file into BetterDiscord's plugin directory.  On Windows, this is `%APPDATA%/BetterDiscord/plugins`.  On OSX this is `~/Library/Preferences/BetterDiscord/plugins` (I think)

Restart Discord after doing this and you should be in business.
