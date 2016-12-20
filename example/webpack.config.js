var path = require('path');
var webpack = require('webpack');
var Mix = require('laravel-webpacker').config;
var plugins = require('laravel-webpacker').plugins;


/*
 |--------------------------------------------------------------------------
 | Mix Initialization
 |--------------------------------------------------------------------------
 |
 | As our first step, we'll require the project's Laravel Mix file
 | and record the user's requested compilation and build steps.
 | Once those steps have been recorded, we may get to work.
 |
 */

require('./webpack.mix');

Mix.finalize();


/*
 |--------------------------------------------------------------------------
 | Webpack Entry
 |--------------------------------------------------------------------------
 |
 | We'll first specify the entry point for Webpack. By default, we'll
 | assume a single bundled file, but you may call Mix.extract()
 | to make a separate bundle specifically for vendor libraries.
 |
 */

module.exports.entry = { app: Mix.entry() };

if (Mix.js.vendor) {
    module.exports.entry.vendor = Mix.js.vendor;
}



/*
 |--------------------------------------------------------------------------
 | Webpack Output
 |--------------------------------------------------------------------------
 |
 | Webpack naturally requires us to specify our desired output path and
 | file name. We'll simply echo what you passed to with Mix.js().
 | Note that, for Mix.version(), we'll properly hash the file.
 |
 */

module.exports.output = Mix.output();



/*
 |--------------------------------------------------------------------------
 | Rules
 |--------------------------------------------------------------------------
 |
 | Webpack rules allow us to register any number of loaders and options.
 | Out of the box, we'll provide a handful to get you up and running
 | as quickly as possible, though feel free to add to this list.
 |
 */

module.exports.module = {
    rules: [
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    js: 'babel-loader?cacheDirectory=true'
                  },
                  
                  postcss: [
                    require('autoprefixer')
                ]
            }
        },

        {
            test: /\.js$/,
            loader: 'babel-loader?cacheDirectory=true',
            exclude: /(node_modules|bower_components)/
        },

        {
            test: /\.(png|jpg|gif)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]?[hash]'
            }
        },

        {
            test: /\.(woff2?|ttf|eot|svg)$/,
            loader: 'file-loader',
            options: {
                name: path.relative(__dirname, './fonts/[name].[ext]?[hash]')
            }
        }
    ]
};


if (Mix.sass) {
    module.exports.module.rules.push({
        test: /\.s[ac]ss$/,
        loader: plugins.ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: [
                'css-loader', 'postcss-loader', 
                'resolve-url-loader', 'sass-loader?sourceMap'
            ]
        })
    });
}


if (Mix.less) {
    module.exports.module.rules.push({
        test: /\.less$/,
        loader: plugins.ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: [
                'css-loader', 'postcss-loader', 
                'resolve-url-loader', 'less-loader?sourceMap'
            ]
        })
    });
}



/*
 |--------------------------------------------------------------------------
 | Resolve
 |--------------------------------------------------------------------------
 |
 | Here, we may set any options/aliases that affect Webpack's resolving
 | of modules. To begin, we will provide the necessary Vue alias to
 | load the Vue common library. You may delete this, if needed.
 |
 */

module.exports.resolve = {
    alias: {
        'vue$': 'vue/dist/vue.common.js'
    }
};



/*
 |--------------------------------------------------------------------------
 | Stats
 |--------------------------------------------------------------------------
 |
 | By default, Webpack spits a lot of information out to the terminal, 
 | each you time you compile. Let's keep things a bit more minimal
 | and hide a few of those bits and pieces. Adjust as you wish.
 |
 */

module.exports.stats = {
    hash: false,
    version: false,
    timings: false
};

module.exports.performance = { hints: Mix.inProduction };



/*
 |--------------------------------------------------------------------------
 | Devtool
 |--------------------------------------------------------------------------
 |
 | Sourcemaps allow us to access our original source code within the
 | browser, even if we're serving a bundled script or stylesheet.
 | You may activate sourcemaps, by adding Mix.sourceMaps().
 |
 */

module.exports.devtool = Mix.sourcemaps;



/*
 |--------------------------------------------------------------------------
 | Webpack Dev Server Configuration
 |--------------------------------------------------------------------------
 |
 | If you want to use that flashy hot module replacement feature, then
 | we've got you covered. Here, we'll set some basic initial config
 | for the Node server. You very likely won't want to edit this.
 |
 */
module.exports.devServer = {
    historyApiFallback: true,
    noInfo: true
};



/*
 |--------------------------------------------------------------------------
 | Plugins
 |--------------------------------------------------------------------------
 |
 | Lastly, we'll register a number of plugins to extend and configure 
 | Webpack. To get you started, we've included a handful of useful
 | extensions, for versioning, OS notifications, and much more.
 |
 */

module.exports.plugins = [];


if (Mix.notifications) {
    module.exports.plugins.push(
        new plugins.WebpackNotifierPlugin({
            title: 'Laravel Mix',
            alwaysNotify: true,
            contentImage: 'node_modules/laravel-webpacker/icons/laravel.png'
        })
    );
}


module.exports.plugins.push(
    function() {
        this.plugin('done', stats => Mix.manifest.write(stats));
    }
);


if (Mix.versioning.enabled) {
    Mix.versioning.record();

    module.exports.plugins.push(
        new plugins.WebpackOnBuildPlugin(stats => {
            Mix.versioning.prune(Mix.publicPath);
        })
    );
}


if (Mix.combine || Mix.minify) {
    module.exports.plugins.push(
        new plugins.WebpackOnBuildPlugin(stats => {
            Mix.concatenateAll().minifyAll();
        })
    );
}


if (Mix.copy) {
    Mix.copy.forEach(copy => {
        module.exports.plugins.push(
            new plugins.CopyWebpackPlugin([copy])
        );
    });
}


if (Mix.js.vendor) {
    module.exports.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
        })
    );
}


if (Mix.cssPreprocessor) {
    let cssOutputPath = Mix[Mix.cssPreprocessor].output[
        Mix.versioning.enabled ? 'hashedPath' : 'path'
    ];

    module.exports.plugins.push(
        new plugins.ExtractTextPlugin({
            filename: cssOutputPath.replace('public', '')
        })
    );
}


if (Mix.inProduction) {
    module.exports.plugins = module.exports.plugins.concat([
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),

        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: { 
                warnings: false 
            }
        }),

        new webpack.LoaderOptionsPlugin({
            minimize: true,
            options: {
                postcss: [ 
                    require('autoprefixer')
                ],
                context: __dirname,
                output: { path: './' }
            }
        })
    ]);
}
