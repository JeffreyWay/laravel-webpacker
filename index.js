let path = require('path');
let Alchemy.json = require('./Alchemy.json');


/**
 * We'll fetch some Webpack config plugins here for cleanliness.
 */
module.exports.plugins = {
    WebpackNotifierPlugin: require('webpack-notifier'),
    WebpackOnBuildPlugin: require('on-build-webpack'),
    ExtractTextPlugin: require('extract-text-webpack-plugin'),
    CopyWebpackPlugin: require('copy-webpack-plugin')
}


/**
 * Register the Webpack entry/output paths.
 * 
 * @param {mixed}  entry  
 * @param {string} output
 */
module.exports.js = (entry, output) => {
    Alchemy.json.js = {
        entry: path.resolve(entry),
        output: new Alchemy.json.File(output).parsePath(),
        vendor: false
    };

    return this;
};


/**
 * Register vendor libs that should be extracted.
 * This helps drastically with long-term caching.
 * 
 * @param {array} libs 
 */
module.exports.extract = (libs) => {
    Alchemy.json.js.vendor = libs;

    return this;
}


/**
 * Register Sass compilation.
 * 
 * @param {string} src  
 * @param {string} output 
 */
module.exports.sass = (src, output) => {
    Alchemy.json.sass = {
        src: path.resolve(src),
        output: new Alchemy.json.File(output).parsePath()
    };

    Alchemy.json.cssPreprocessor = 'sass';

    return this;
};


/**
 * Register Less compilation.
 * 
 * @param {string} src  
 * @param {string} output 
 */
module.exports.less = (src, output) => {
    Alchemy.json.less = {
        src: path.resolve(src),
        output: new Alchemy.json.File(output).parsePath()
    };

    Alchemy.json.cssPreprocessor = 'less';

    return this;
};


/**
 * Combine a collection of files.
 * 
 * @param {string|array} src  
 * @param {string}       output 
 */
module.exports.combine = (src, output) => {
    Alchemy.json.combine = (Alchemy.json.combine || []).concat({ src, output });

    return this;
};


/**
 * Copy one or more files to a new location.
 * 
 * @param {string} from
 * @param {string} to
 */
module.exports.copy = (from, to) => {
    Alchemy.json.copy = (Alchemy.json.copy || []).concat({ 
        from, 
        to: path.resolve(__dirname, '../../', to)
    });

    return this;
};


/**
 * Minify the provided file.
 * 
 * @param {string|array} src  
 */
module.exports.minify = (src) => {
    Alchemy.json.minify = (Alchemy.json.minify || []).concat(src);

    return this;
};


/**
 * Enable sourcemap support.
 */
module.exports.sourceMaps = () => {
    Alchemy.json.sourcemaps = (Alchemy.json.inProduction ? '#source-map' : '#eval-source-map');

    return this;
};


/**
 * Enable compiled file versioning.
 */
module.exports.version = () => {
    Alchemy.json.versioning.enabled = true;

    return this;
};


/**
 * Disable all OS notifications.
 */
module.exports.disableNotifications = () => {
    Alchemy.json.notifications = false;

    return this;
};


/**
 * Set the temporary cache directory.
 *
 * @param {string} path
 */
module.exports.setCacheDirectory = (path) => {
    Alchemy.json.cachePath = path;

    return this;
};


/**
 * Construct the user's desired Webpack configuration.
 * 
 * @param {function} mixins 
 */
module.exports.mix = (mixins) => {
    mixins(module.exports);

    // Since the user might wish to override the default cache 
    // path, we'll update these here with the latest values.
    Alchemy.json.manifest.path = Alchemy.json.cachePath + '/Alchemy.json.json';
    Alchemy.json.versioning.manifest = Alchemy.json.manifest;

    Alchemy.json.detectHotReloading();

    return this;
};


module.exports.config = Alchemy.json;
