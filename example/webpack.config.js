var path = require('path');
var webpack = require('webpack');
var Elixir = require('./webpack.elixir').config;
var plugins = require('./webpack.elixir').plugins;


/*
 |--------------------------------------------------------------------------
 | Webpack Entry
 |--------------------------------------------------------------------------
 |
 | We'll first specify the Webpack entry point into our application. If a 
 | preprocessor is being used, we'll add it as a secondary entrypoint.
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
 | Next, we need to specify our desired output path for the bundled Webpack file.
 | If the user called `Elixir.version()`, we'll hash/cache the output as well.
 |
 */

module.exports.output = Elixir.output();


/*
 |--------------------------------------------------------------------------
 | Rules
 |--------------------------------------------------------------------------
 |
 | We may now register any loaders/rules for Webpack. Feel free to 
 | modify these to fit your project's needs. Otherwise, the 
 | default should do fine.
 |
 */

module.exports.module = {
    rules: [
        {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: { // vue-loader options
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
            loader: ['css-loader', 'postcss-loader', 'resolve-url-loader', 'sass-loader?sourceMap']
        })
    });
}


if (Elixir.less) {
    module.exports.module.rules.push({
        test: /\.less$/,
        loader: plugins.ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'postcss-loader', 'resolve-url-loader', 'less-loader']
        })
    });
}


/*
 |--------------------------------------------------------------------------
 | Resolve
 |--------------------------------------------------------------------------
 |
 | Here, we may set any options/aliases that affect the resolving of modules.
 | To start, we'll provide the appropriate alias for Vue 2.
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
 | each you time you run. Let's keep things a bit more minimal,
 | however, you're of course free to delete this if you wish.
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
 | If the user requests sourcemap support, with `Elixir.sourceMaps()`, we'll provide 
 | a sensible default, depependent upon the environment. Again, feel free to modify
 | this as needed.
 |
 */

module.exports.devtool = Elixir.sourcemaps;


/*
 |--------------------------------------------------------------------------
 | Plugins
 |--------------------------------------------------------------------------
 |
 | Lastly, we'll register a number of plugins to extend Webpack. Plugins allow
 | both authors and you to extend the underlying behavior of Webpack.
 |
 */

module.exports.plugins = [];


// We want an OS notification for all first/failed compilations.
// If you hate notifications, feel free to delete this line.
if (Elixir.notifications) {
    module.exports.plugins.push(
        new plugins.WebpackNotifierPlugin({
            title: 'Laravel Elixir',
            alwaysNotify: true,
            contentImage: path.join(__dirname, 'node_modules/laravel-webpacker/icons/laravel.png')
        })
    );
}


// We need to register a hook for when Webpack is finished with
// its build. That way, we can perform various non-Webpack
// specific tasks, such as conctenation/minification.
module.exports.plugins.push(
    new plugins.WebpackOnBuildPlugin(stats => {
        Elixir.concatenateAll().minifyAll();
    })
);


// This allows you to run Elixir.copy() to copy any number 
// of files/directories as you need. Note that the copy
// will only take place, if the file is modified.
if (Elixir.copy) {
    Elixir.copy.forEach(copy => {
        module.exports.plugins.push(
            new plugins.CopyWebpackPlugin([copy])
        );
    });
}


// We'll write the build stats to a file, just in case. In particular, 
// your server-side code may read this file to detect the cached 
// file name.
module.exports.plugins.push(
    function() {
        this.plugin('done', stats => {
            new Elixir.File(
                path.join(__dirname, 'storage/logs/stats.json')
            ).write(JSON.stringify(stats.toJson()));
        });
    }
);


// Grouping application code with vendor libraries is 
// terrible for caching. Instead, we'll extract 
// all vendor code to a dedicated file.
if (Elixir.js.vendor) {
    module.exports.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
        })
    );
}


// If the user called `Elixir.sass()` or `Elixir.less()`, we'll 
// keep things traditional, and enable the necessary plugin to 
// extract the CSS to its own, dedicated file. 
if (Elixir.cssPreprocessor) {
    module.exports.plugins.push(
        new plugins.ExtractTextPlugin(
            path.relative(
                Elixir.js.output.base, 
                Elixir[Elixir.cssPreprocessor].output[Elixir.hash ? 'hashedPath' : 'path']
            )
        )
    );
}


// Certain plugins are only appropriate during production. If 
// NODE_ENV=production, we'll optimize the bundle as such.
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
                ]
            }
        })
    ]);
}
