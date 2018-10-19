Download `BPM.for.Discord.discord-VERSION.7z`

Use a 7zip unarchiver to unpack.  [7zip](http://www.7-zip.org/download.html) is the best installation for Windows.  I can't reliably refer you one for Mac.  Linux you are also on your own but _should_ be able to get a good one from your distribution's package manager.

## Non-PTB Installation

**IF YOU DO NOT UNPACK THE ARCHIVE AND TRY TO RUN THE SCRIPT FROM WITHIN IT THE INSTALL _WILL_ FAIL.**

**YOU MUST RESTART DISCORD AFTER INSTALL**

_If any of these break, please create an issue on the issues page with your OS and a screenshot of the console's contents._

**Windows**:  Double click `install_windows.bat`.  You will be prompted if it's okay to download Node.js if a `v4.2.x` binary is not already present on your PATH.  This will require about 12MB free space and be immediately cleaned up after it's done.

**Mac**:  Double click `install_mac.command`.  If you do not have a node `v4.2.x` installation on your PATH, it will download a standalone tarball which will be removed when the install is complete.  Requires about 32MB free space which will be immediately regained after it's done installing and cleans up after itself (Node's expanded OSX tarball is shockingly large).

**Linux**: Run `install_linux.sh` from the terminal.  You will be prompted for the location of the discord binary.  This installer may have a few kinks in it, but is fairly stable.  Much thanks to [@ILikePizza555](https://github.com/ILikePizza555) for coding it up!

**Manual**:  Run `index.js .` from within the extracted archive with a Node.js `v4.2.x` binary.  This method is useful for automated installation.

## PTB Installation

**Windows**:  Double click `install_windows_PTB.bat`  

**Mac**:  Same as non-ptb, but double-click `install_mac_PTB.command`

**Linux**: The entire client is a PTB as it is, so this is not yet supported

If you get it working let me know.

## Uninstall

There are three basic steps:

1.  Find the `discord_desktop_core` folder
2.  Delete `core.asar`
3.  Rename `core.asar.clean` to `core.asar`

If Discord breaks at any of these steps, you should be able to re-install it and be fine.

## Finding the discord\_desktop\_core folder

### Windows

The folder should be at:

`%APPDATA%/discord/LATEST_VERSION_NUMBER/modules/discord_desktop_core`

`LATEST_VERSION_NUMBER` should be (as of the time of writing this), `0.0.301`, but if there are more folders that are just numbers like that, pick the largest one.

### Mac

The folder should be at:

`~/Library/Application Support/Discord/modules/discord_desktop_core`

### Linux

The folder should be at:

`~/.config/discord/modules/discord_desktop_core`

OR

`$XDG_CONFIG_HOME/discord/modules/discord_desktop_core`

If you pointed the installer somewhere else, you will have to find where it is.

