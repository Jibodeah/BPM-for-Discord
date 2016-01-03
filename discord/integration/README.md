# BPM for Discord Integration Layer

This code should be injected as a dependency into `app.asar`'s `node_modules` folder, and a dependency to it should be added to `package.json`.  You can enable a development console by uncommenting the `openDevConsole()` line found in `bpm.js`.

This layer should really just handle loading the scripts into Discord's Electron environment.  The rest of the magic happens inside BPM code proper (via `discord-ext` specific cases and files specifically built in to the discord distribution via the `Makefile`).

# What the code does:

* Creates and executes JS to insert the CSS required by BPM
* Creates and executes JS to insert the HTML required for Discord's settings
* Creates and executes JS to insert the Search button
* Executes all BPM for Discord scripts
* Executes all BPM scripts

