# One-click installer scripts for BPM for Discord.

*Windows installer*: `install_windows.bat`

*Mac installer*: `install_mac.command`

*Linux installer*: `install_linux.sh`

## Install Script - `index.js`
The install script takes one argument, which is the path the `bpm.asar` and `integration.asar` files are in.  If it is not provided it assumes `.` is where they will be found.  I didn't want this command at all, but it turns out when you double-click a `.command` file in OSX it runs with $PWD as `~`, not the location of the `.command` file.

The process the install script follows is:

1.  Find Discord's resources directory

* On Windows this is `%LOCALAPPDATA%\discord\app-LATEST_VERSION\resources`
* On OSX this is `/Applications/Discord.app/Contents/Resources`

2.  Back up `app.asar` to `app.asar.clean` if `app.asar.clean` does not already exist

3.  Unpack `app.asar.clean`

4.  Inject the BPM integration code into the `node_modules` directory

5.  Inject a dependency on the BPM integration into `package.json`

6.  Inject a require statement at the head of `index.js` to require the bpm integration

7.  Inject a statement to construct the BPM object and pass it the main window into `index.js`

8.  Repack the modified `asar` and replace `app.asar` with it

9.  Unpack `bpm.asar` into a local data directory

* On Windows this is `%APPDATA%/discord`
* On OSX this is `~/Library/Preferences/discord`

## Windows-specific
The windows installer consists of two files:
* `install_windows.bat`
* `win_ps.ps1`

`install_windows.bat` is a batch file that basically just sidesteps Windows' powershell execution restriction settings and runs the powershell script, `win_ps.ps1`.  `win_ps.ps1` is a powershell script that checks if node exists.  If it does, it checks the version.  If Node.js does not exist or the version is not `v4.2.x`, it downloads the binary from Node.js's download site executes `index.js`, and then deletes the downloaded binary.  If a good Node.js version is found, it just executes `index.js`

## Mac-specific
The mac installer consists of one file:
* `install_mac.command`

`install_mac.command` checks if `node` exists.  If it does, it runs `node.js`, else it downloads the binary tarball, extracts the `node` binary, runs `index.js`, and then deletes the downloaded binary and tarball.

## Linux-specific
The linux installer consists of one file:
* `install_linux.sh`

It is important to note that this file **must be invoked from a terminal**.

You will be prompted for the path to your Discord install.  The script _should_ check to make sure that it's a valid path.  It will then ask to grab a node binary if you don't have one, download it if it's okay (it will quit if not), and then execute `index.js

