let fs = require('fs');
let path = require('path');
var uglify = require('uglify-js');
var UglifyCss = require('clean-css');


// Webpack.config.js Plugins
module.exports.plugins = {
    concatenate: require('concatenate'),
    WebpackNotifierPlugin: require('webpack-notifier'),
    WebpackOnBuildPlugin: require('on-build-webpack'),
    ExtractTextPlugin: require("extract-text-webpack-plugin")
}


/**
 * Register the Webpack entry/output paths.
 * 
 * @param  {mixed}   entry  
 * @param  {string}  output 
 */
module.exports.js = (entry, output) => {
    Elixir.js = {
        entry,
        output: new File(output).parsePath()
    };

    return this;
};


/**
 * Register Sass compilation.
 * 
 * @param  {string}  src  
 * @param  {string}  output 
 */
module.exports.sass = (src, output) => {
    Elixir.sass = {
        src,
        output: new File(output).parsePath()
    };

    Elixir.cssPreprocessor = 'sass';

    return this;
};


/**
 * Register Less compilation.
 * 
 * @param  {string}  src  
 * @param  {string}  output 
 */
module.exports.less = (src, output) => {
    Elixir.less = {
        src,
        output: new File(output).parsePath()
    };

    Elixir.cssPreprocessor = 'less';

    return this;
};


/**
 * Combine a collection of files.
 * 
 * @param  {string|array}  src  
 * @param  {string}        output 
 */
module.exports.combine = (src, output) => {
    Elixir.combine = (Elixir.combine || []).concat({ src, output });

    return this;
};


/**
 * Minify the provided file.
 * 
 * @param  {string|array}  src  
 */
module.exports.minify = (src) => {
    Elixir.minify = (Elixir.minify || []).concat(src);

    return this;
};


/**
 * Enable sourcemap support.
 */
module.exports.sourceMaps = () => {
    Elixir.sourcemaps = (Elixir.inProduction ? '#eval-source-map' : '#source-map');

    return this;
};


/**
 * Enable compiled file versioning.
 */
module.exports.version = () => {
    Elixir.hash = true;

    return this;
};


let Elixir = {
    inProduction: process.env.NODE_ENV === 'production',
    sourcemaps: false,
    cssPreprocessor: false,
    hash: false,
    entry() {
        if (this.cssPreprocessor) {
            return [this.js.entry, this[this.cssPreprocessor].src];
        }

        return this.js.entry;
    }
};


let File = Elixir.File = class {
    /**
     * Create a new File instance.
     * 
     * @param  {string}  file
     */
    constructor(file) {
        this.file = file;
        this.fileType = path.parse(file).ext;
    }


    /**
     * Minify the file, if it is CSS or JS.
     */
    minify() {
        if (this.fileType === '.js') {
            this.write(uglify.minify(this.file));
        }

        if (this.fileType === '.css') {
            let css = new UglifyCss().minify(
                fs.readFileSync(this.file, { encoding: 'utf-8' })
            ).styles;

            fs.writeFileSync(this.file, css);
        }
    }


    /**
     * Write the given contents to the file.
     * 
     * @param  {string}  body
     */
    write(body) {
        fs.writeFileSync(this.file, body);
    }


    /**
     * Parse the file path into segments.
     */
    parsePath() {
        let outputSegments = path.parse(this.file);

        return {
            path: this.file,
            hashedPath: `${outputSegments.dir}/${outputSegments.name}.[hash]${outputSegments.ext}`,
            base: outputSegments.dir,
            file: outputSegments.base,
            hashedFile: `${outputSegments.name}.[hash]${outputSegments.ext}`,
            name: outputSegments.name,
            ext: outputSegments.ext
        };
    } 
};


module.exports.config = Elixir;
