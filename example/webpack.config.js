var path = require('path');
var webpack = require('webpack');
var Elixir = require('./webpack.elixir').config;
var plugins = require('./webpack.elixir').plugins;


/*
 |--------------------------------------------------------------------------
 | Webpack Entry
 |--------------------------------------------------------------------------
 |
 | We'll first specify the entry point for Webpack. By default, we'll
 | assume a single bundled file, but you may call Elixir.extract()
 | to make a separate bundle specifically for vendor libraries.
 |
 */

module.exports.entry = { app: Elixir.entry() };

if (Elixir.js.vendor) {
    module.exports.entry.vendor = Elixir.js.vendor;
}


/*
 |--------------------------------------------------------------------------
 | Webpack Output
 |--------------------------------------------------------------------------
 |
 | Webpack naturally requires us to specify our desired output path and
 | file name. We'll simply echo what you passed to with Elixir.js().
 | Note that, for Elixir.version(), we'll properly hash the file.
 |
 */

module.exports.output = Elixir.output();


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
            test: /\.(png|jpg|gif|svg)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]?[hash]'
            }
        },

        {
            test: /\.(woff2?|ttf|eot)$/,
            loader: 'file-loader',
            options: {
                name: path.relative(__dirname, '../fonts/[name].[ext]?[hash]')
            }
        }
    ]
};


if (Elixir.sass) {
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


if (Elixir.less) {
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


/*
 |--------------------------------------------------------------------------
 | Devtool
 |--------------------------------------------------------------------------
 |
 | Sourcemaps allow us to access our original source code within the
 | browser, even if we're serving a bundled script or stylesheet.
 | You may activate sourcemaps, by adding Elixir.sourceMaps().
 |
 */

module.exports.devtool = Elixir.sourcemaps;


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


if (Elixir.notifications) {
    module.exports.plugins.push(
        new plugins.WebpackNotifierPlugin({
            title: 'Laravel Elixir',
            alwaysNotify: true,
            contentImage: path.join(__dirname, 'node_modules/laravel-webpacker/icons/laravel.png')
        })
    );
}


if (Elixir.versioning.enabled) {
    module.exports.plugins.push(
        new plugins.AssetsPlugin({
            filename: Elixir.versioning.manifestPath,
            prettyPrint: true
        })
    );

    Elixir.versioning.record();
}


module.exports.plugins.push(
    new plugins.WebpackOnBuildPlugin(stats => {
        Elixir.concatenateAll().minifyAll();

        if (Elixir.versioning.enabled) {
            Elixir.versioning.prune(Elixir.js.output.base);
        }
    })
);


if (Elixir.copy) {
    Elixir.copy.forEach(copy => {
        module.exports.plugins.push(
            new plugins.CopyWebpackPlugin([copy])
        );
    });
}


if (Elixir.js.vendor) {
    module.exports.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
        })
    );
}


if (Elixir.cssPreprocessor) {
    module.exports.plugins.push(
        new plugins.ExtractTextPlugin(
            path.relative(
                Elixir.js.output.base, 
                Elixir[Elixir.cssPreprocessor].output[Elixir.versioning.enabled ? 'hashedPath' : 'path']
            )
        )
    );
}


if (Elixir.inProduction) {
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
