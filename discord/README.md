# BPM for Discord

This directory contains code for installing and running BPM inside of Discord's Mac and Windows Desktop apps (Linux support coming when a desktop app is added to Linux).

All changes in build process are contained in the Makefile of the root of this repo.

## Development practices

All changes to Discord-specific code should be done on the `discord` branch.  All of these changes should live in the `discord` directory.  Browser code should live in `discord/addon`, `app.asar` code should live in `discord/integration` and installer code should live in `discord/installer`. 

All changes to the BPM core should be made on `discord-core-changes`.  These changes should then be PR'd up to the BPM main repo.  When these changes are committed to the branch `discord` should be rebased on top of `discord-core-changes` (I am aware this will require a `git push --force origin discord`.  I am willing to accept that risk on my own repo).

## Build

Building BPM for Discord requires:
* Node.js `v4.2.x`
* `asar` -- this can be acquired via `npm install -g asar`

The following build hooks are available:
* `make discord`
* `make discord/release`

### `make discord`

1. Moves all files from `discord/installer` to `build/discord`
2. Packs all files from `discord/integration` into `integration.asar` and moves it to `build/discord/integration.asar`
3. Builds all BPM content and scripts
4. Moves all files from `build/addon` into `build/discord/addon`
5. Concatenates all settings scripts from `discord/addon` into a single `settings.js` and moves it to `build/discord/addon/settings.js`
6. Moves all other scripts and files from `discord/addon` to `build/discord/addon`
7. Packs `build/discord/addon` into `build/discord/bpm.asar` and deletes `build/discord/addon`

The final contents of `build/discord` should now look like this:
    /bpm.asar
    /integration.asar
    /CONTENTS-OF-`discord/installer`

### `make discord/release`

1.  Ensures `make discord` has been run/is up to date
2.  Executes `git status` and `git log -1` and prompts the user if they're sure this is what they want to release
3.  If the user is sure, tags the current branch's `HEAD` with `DISCORD-VERSION` from the Makefile (if the tag already exists this process fails)
4.  Pushes the new tag to github
5.  Packs the contents of `build/discord` into `build/BPM for Discord DISCORD-VERSION.7z`

Everything should now be in place to set up the release on Github.  Note that this only pushes the tag and does **not** upload the 7z file automatically to Github nor does it create the release draft.  This is intentional and should be done manually.

## Releases and Updates

BPM for Discord includes update notifications as part of its core feature set.  Updates are detected using the Github API's Releases endpoint.  If the user's current version does not match the name of the `tag` the latest non-draft, non-pre-release Release pulled from the API, they are notified in some way to update their BPM install.

What this means practically for performing releases:

**DO NOT SAVE A NON-DRAFT RELEASE AS A NON-PRE-RELEASE UNTIL YOU HAVE TESTED THE 7Z LOCALLY**

 All users (as of `discord-v0.5.0-beta`) will be notified that this has occured and will try to update accordingly.  

If you wish to perform a release that does _not_ notify users (for example if only the installers have been updated or the feature set is small enough that it's not worth bothering our end users), upload the release but **flag it as a pre-release**.

## Submodules

* Installer
* Integration
* Addon

See each subfolder for what each submodule does.

