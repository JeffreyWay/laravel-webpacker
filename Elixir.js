let concatenate = require('concatenate');
let path = require('path');
let File = require('./File');

module.exports = {
    /**
     * Determine the current environment.
     */
    inProduction: process.env.NODE_ENV === 'production',


    /**
     * Should we apply sourcemaps when bundling?
     */
    sourcemaps: false,


    /**
     * Which CSS preprocessor, if any, are we using.
     *
     * Options: sass, less
     */
    cssPreprocessor: false,


    /**
     * Should the bundled JS/CSS be versioned?
     */
    hash: false,


    /**
     * Should we display notifications?
     */
    notifications: true,


    /**
     * Determine the Webpack entry file.
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
            filename = this.hash ? '[chunkhash].[name].js' : '[name].js';
        } else {
            filename = this.hash ? this.js.output.hashedFile : this.js.output.file;
        }

        return {
            path: path.resolve(__dirname, '../../', this.js.output.base),
            filename
        };
    },
    

    /**
     * Minify the given files, or those from Elixir.minify().
     * 
     * @param  array|null  files 
     */
    minifyAll(files = null) {
        if (! this.inProduction) return;

        files = files || this.minify || [];

        files.forEach(file => new File(file).minify());

        return this;
    },

    
    /**
     * Concat the given files, or those from Elixir.combine().
     * 
     * @param  array|null  files 
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
     * The File dependency,
     */
    File: File
};
