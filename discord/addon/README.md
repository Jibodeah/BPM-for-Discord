# Discord Browser Code

The code contained in this folder is executed in Discord's Electron browser window.  Each module is compiled down to its own JS file via Webpack (see the Makefile for details) and executed by the integration layer when Discord's `mainWindow` object is constructed.

All of the webpacked scripts are packed into `bpm.asar` during the build process.
