const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
    resolve: { 
        extensions: ['.js',] 
    },
    entry: "./src",
    output: {
        path: path.resolve(__dirname, ""),
        filename: 'bot.js'
    },
    target: 'node', // in order to ignore built-in modules like path, fs, etc.
    externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
    optimization: {
        minimize: true
    },
};