let path = require('path');
let Elixir = require('./Elixir');


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
    Elixir.js = {
        entry: path.resolve(entry),
        output: new Elixir.File(output).parsePath(),
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
    Elixir.js.vendor = libs;

    return this;
}


/**
 * Register Sass compilation.
 * 
 * @param {string} src  
 * @param {string} output 
 */
module.exports.sass = (src, output) => {
    Elixir.sass = {
        src: path.resolve(src),
        output: new Elixir.File(output).parsePath()
    };

    Elixir.cssPreprocessor = 'sass';

    return this;
};


/**
 * Register Less compilation.
 * 
 * @param {string} src  
 * @param {string} output 
 */
module.exports.less = (src, output) => {
    Elixir.less = {
        src: path.resolve(src),
        output: new Elixir.File(output).parsePath()
    };

    Elixir.cssPreprocessor = 'less';

    return this;
};


/**
 * Combine a collection of files.
 * 
 * @param {string|array} src  
 * @param {string}       output 
 */
module.exports.combine = (src, output) => {
    Elixir.combine = (Elixir.combine || []).concat({ src, output });

    return this;
};


/**
 * Copy one or more files to a new location.
 * 
 * @param {string} from
 * @param {string} to
 */
module.exports.copy = (from, to) => {
    Elixir.copy = (Elixir.copy || []).concat({ 
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
    Elixir.minify = (Elixir.minify || []).concat(src);

    return this;
};


/**
 * Enable sourcemap support.
 */
module.exports.sourceMaps = () => {
    Elixir.sourcemaps = (Elixir.inProduction ? '#source-map' : '#eval-source-map');

    return this;
};


/**
 * Enable compiled file versioning.
 */
module.exports.version = () => {
    Elixir.versioning.enabled = true;

    return this;
};


/**
 * Disable all OS notifications.
 */
module.exports.disableNotifications = () => {
    Elixir.notifications = false;

    return this;
};


/**
 * Set the temporary cache directory.
 *
 * @param {string} path
 */
module.exports.setCacheDirectory = (path) => {
    Elixir.cachePath = path;

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
    Elixir.manifest.path = Elixir.cachePath + '/elixir.json';
    Elixir.versioning.manifest = Elixir.manifest;

    Elixir.detectHotReloading();
};


module.exports.config = Elixir;
