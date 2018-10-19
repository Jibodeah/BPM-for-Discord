const webpack = require('webpack'),
    path = require('path');

module.exports = {
    entry: './bpm.js',
    mode: 'development',
    output: {
        filename: 'bpm.js',
        path: path.resolve(__dirname, 'dist')
    },
};
