let path = require('path');
let File = require('./File');
let Versioning = require('./Versioning');
let Manifest = require('./Manifest');
let concatenate = require('concatenate');

let cachePath = 'storage/framework/cache';

module.exports = {
    /**
     * Determine the current environment.
     */
    inProduction: process.env.NODE_ENV === 'production',


    /**
     * Where should we store temporary cache?
     */
    cachePath: cachePath,


    /**
     * The path to the app's public directory.
     */
    publicPath: './public',


    /**
     * Should we apply sourcemaps when bundling?
     */
    sourcemaps: false,


    /**
     * Is hot module replacement enabled?
     */
    hmr: false,


    /**
     * Which CSS preprocessor, if any, are we using.
     *
     * Options: sass, less
     */
    cssPreprocessor: false,


    /**
     * Versioning configuration, if enabled.
     */
    versioning: new Versioning(new Manifest(cachePath + '/elixir.json')),


    /**
     * The manifest file, which Laravel uses to calculate file names
     */
    manifest: new Manifest(cachePath + '/elixir.json'),


    /**
     * Should we display notifications?
     */
    notifications: true,


    /**
     * Initialize the Elixir instance. 
     */
    init() {
        let file = new this.File(this.cachePath + '/hot');

        file.delete();

        // If the user wants hot module replacement, we'll create 
        // a temporary file, so that Laravel can detect it, and
        // reference the proper base URL for any assets.
        if (process.argv.includes('--hot')) {
            this.hmr = true;

            file.write('hot reloading enabled');
        }
    },


    /**
     * Determine the Webpack entry file(s).
     */
    entry() {
        if (this.cssPreprocessor) {
            return [this.js.entry, this[this.cssPreprocessor].src];
        }

        return this.js.entry;
    },


    /**
     * Determine the Webpack output path.
     */
    output() {
        let filename;

        if (this.js.vendor) {
            filename = this.versioning.enabled ? '[name].[hash].js' : '[name].js';
        } else {
            filename = this.versioning.enabled ? this.js.output.hashedFile : this.js.output.file;
        }

        return {
            path: this.hmr ? '/' : this.publicPath,
            filename: 'js/' + filename,
            publicPath: this.hmr ? 'http://localhost:8080/' : './'
        };
    },
    

    /**
     * Minify the given files, or those from Elixir.minify().
     * 
     * @param array|null files 
     */
    minifyAll(files = null) {
        if (! this.inProduction) return;

        files = files || this.minify || [];

        files.forEach(file => new File(file).minify());

        return this;
    },

    
    /**
     * Combine the given files, or those from Elixir.combine().
     * 
     * @param array|null files 
     */
    concatenateAll(files = null) {
        files = files || this.combine || [];

        files.forEach(file => {
            concatenate.sync(file.src, file.output);

            if (! this.inProduction) return;

            new this.File(file.output).minify();
        });

        return this;
    },


    /**
     * File can handle various read/write operations.
     */
    File: File
};
