var path = require('path');
var Elixir = require('./elixir').config;
var plugins = require('./elixir').plugins;


/*
 |--------------------------------------------------------------------------
 | Webpack Entry
 |--------------------------------------------------------------------------
 |
 | We'll first specify the Webpack entry point into our application. If a 
 | preprocessor is being used, we'll add it as a secondary entrypoint.
 |
 */

module.exports.entry = Elixir.entry();


/*
 |--------------------------------------------------------------------------
 | Webpack Output
 |--------------------------------------------------------------------------
 |
 | Next, we need to specify our desired output path for the bundled Webpack file.
 | If the user called `Elixir.version()`, we'll hash/cache the output as well.
 |
 */

module.exports.output = {
    path: path.resolve(__dirname, Elixir.js.output.base),
    filename: Elixir.hash ? Elixir.js.output.hashedFile : Elixir.js.output.file
};


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
            loader: 'vue-loader'
        },

        {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /(node_modules|bower_components)/
        }
    ]
};

if (Elixir.sass) {
    module.exports.module.rules.push({
        test: /\.scss$/,
        loader: plugins.ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'sass-loader']
        })
    });
}

if (Elixir.less) {
    module.exports.module.rules.push({
        test: /\.less$/,
        loader: plugins.ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'less-loader']
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

module.exports.plugins = [
    // We want an OS notification for all first/failed compilations.
    // If you hate notifications, feel free to delete this line.
    new plugins.WebpackNotifierPlugin(),

    // We need to register a hook for when Webpack is finished with
    // its build. That way, we can perform various non-Webpack
    // specific tasks, such as conctenation/minification.
    new plugins.WebpackOnBuildPlugin(stats => {
        (Elixir.combine || []).forEach(toCombine => {
            plugins.concatenate.sync(toCombine.src, toCombine.output);

            if (! Elixir.inProduction) return;

            new Elixir.File(toCombine.output).minify();
        });

        (Elixir.minify || []).forEach(toMinify => {
            if (! Elixir.inProduction) return;

            new Elixir.File(toMinify).minify();
        });
    }),

    // We'll write the build stats to a file, just in case. In particular, 
    // your server-side code may read this file to detect the cached 
    // file name.
    function() {
        this.plugin('done', stats => {
            new Elixir.File(
                path.join(__dirname, 'storage/logs/stats.json')
            ).write(JSON.stringify(stats.toJson()));
        });
    }
];

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
        // This will hunt down any occurrence of the 'process.env' string
        // and replace it with "production."
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),

        // Minification should only take place during production, 
        // since it's a time-consuming process.
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: { 
                warnings: false 
            }
        })
    ]);
}
