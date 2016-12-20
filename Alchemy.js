let path = require('path');
let File = require('./File');
let Manifest = require('./Manifest');
let Versioning = require('./Versioning');
let concatenate = require('concatenate');

module.exports = new class {
    /**
     * Create a new Alchemy instance. 
     */
    constructor() {
        this.inProduction = process.env.NODE_ENV === 'production';
        this.File = File;
        this.hmr = false;
        this.sourcemaps = false;
        this.cssPreprocessor = false;
        this.notifications = true;
        
        this.publicPath = this.isUsingLaravel() ? 'public' : './';
        this.cachePath = this.isUsingLaravel() ? 'storage/framework/cache' : './';
        
        this.manifest = new Manifest(this.cachePath + '/Alchemy.json');
        this.versioning = new Versioning(this.manifest);
    }


    /**
     * Determine the Webpack entry file(s).
     */
    entry() {
        if (this.cssPreprocessor) {
            return [this.js.entry, this[this.cssPreprocessor].src];
        }

        return this.js.entry;
    }


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
            filename: path.join(this.js.output.base, filename).replace(this.publicPath, ''),
            publicPath: this.hmr ? 'http://localhost:8080/' : './'
        };
    }
    

    /**
     * Minify the given files, or those from Alchemy.minify().
     * 
     * @param array|null files 
     */
    minifyAll(files = null) {
        if (! this.inProduction) return;

        files = files || this.minify || [];

        files.forEach(file => new File(file).minify());

        return this;
    }

    
    /**
     * Combine the given files, or those from Alchemy.combine().
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
    }


    /**
     * Detect if the user desires hot reloading.
     */
    detectHotReloading() {
        let file = new this.File(this.cachePath + '/hot');

        file.delete();

        // If the user wants hot module replacement, we'll create 
        // a temporary file, so that Laravel can detect it, and
        // reference the proper base URL for any assets.
        if (process.argv.includes('--hot')) {
            this.hmr = true;

            file.write('hot reloading enabled');
        }
    }


    /**
     * Determine if we are working with a Laravel project.
     */
    isUsingLaravel() {
        return this.File.exists('./artisan');
    }
};
