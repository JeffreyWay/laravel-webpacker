let path = require('path');
let File = require('./File');

class Versioning {
    /**
     * Create a new Versioning instance.
     *
     * @param {string|null} manifestPath
     */
    constructor(manifestPath = null) {
        this.enabled = false;
        this.manifestPath = manifestPath || './storage/framework/cache/elixir.json';

        this.files = [];
    }


    /**
     * Enable Webpack versioning.
     */
    enable() {
        this.enabled = true;

        return this;
    }


    /**
     * Determine if the manifest file exists.
     */
    hasManifest() {
        return File.exists(this.manifestPath);
    }


    /**
     * Retrieve the JSON output from the manifest file.
     */
    readManifest() {
        return JSON.parse(
            new File(this.manifestPath).read()
        );
    }


    /**
     * Record versioned files.
     */
    record() {
        if (! this.hasManifest()) return;

        this.reset();

        let json = this.readManifest();

        Object.keys(json).forEach(entry => {
            this.files = this.files.concat(Object.values(json[entry]));
        });

        return this;
    }


    /**
     * Reset all recorded files.
     */
    reset() {
        this.files = [];

        return this;
    }


    /**
     * Record any newly versioned files, and then delete
     * the old ones that are no longer needed.
     * 
     * @param {string} baseDir 
     */
    prune(baseDir) {
        let updatedVersions = new Versioning(this.manifestPath).enable().record();

        if (! updatedVersions) return;

        this.files.forEach(file => {
            // If the updated file is exactly the same as the old
            // one, then nothing has changed. Don't delete it.
            if (! updatedVersions.files.includes(file)) {
                new File(path.resolve(baseDir, file)).delete();
            }
        });

        // Lastly, we'll replace the versioned file list with the new one.
        this.files = updatedVersions.files;

        return this;
    }
}

module.exports = Versioning;
