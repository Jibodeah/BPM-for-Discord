# Discord Browser Code

The code contained in this folder is executed in Discord's Electron browser window.  Each module is required into `bpm.js`.  `bpm.js` is compiled via Webpack and executed by the integration layer when Discord's `mainWindow` object is constructed.

All of the webpacked scripts are packed into `bpm.asar` during the build process (We should eventually remove packing the script into the `.asar` file).
