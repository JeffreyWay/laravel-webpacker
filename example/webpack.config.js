var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var uglify = require('uglify-js');
var UglifyCss = require('clean-css');
var Elixir = require('./elixir').tasks;
var concatenate = require('concatenate');
var WebpackNotifierPlugin = require('webpack-notifier');
var WebpackOnBuildPlugin = require('on-build-webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    //
    // We'll first specify the Webpack entry point into our application.
    //
    entry: Elixir.cssPreprocessor ? [Elixir.js.entry, Elixir[Elixir.cssPreprocessor].src] : Elixir.js.entry,


    //
    // As well as our desired output path for the bundled file.
    //
    output: {
        path: Elixir.js.output.base, // path.resolve(__dirname, Elixir.js.output.base)
        filename: Elixir.hash ? Elixir.js.output.hashedFile : Elixir.js.output.file
    },  


    //
    // Next, we'll register all relevant loaders for Webpack.
    // Feel free to append to this list, as needed.
    //
    module: {
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
    },


    // 
    // Next, we'll set any options and aliases that affect the resolving of modules.
    //
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },


    //
    // Here, we can specify which type of source map we want.
    //
    devtool: Elixir.sourcemaps ? (Elixir.inProduction ? '#eval-source-map' : '#source-map') : false,


    //
    // Lastly, we'll register a number of plugins.
    //
    plugins: [
        new WebpackNotifierPlugin(),

        // 
        // We need to register a hook for when Webpack is finished 
        // with its build. That way, we can perform any non-Webpack-specific
        // tasks, such as conctenation.
        // 
        new WebpackOnBuildPlugin(stats => {
            (Elixir.combine || []).forEach(toCombine => {
                concatenate.sync(toCombine.src, toCombine.output);

                if (! Elixir.inProduction) return;

                new Elixir.File(toCombine.output).minify();
            });

            (Elixir.minify || []).forEach(toMinify => { // TODO - set an elixir method for this.
                new Elixir.File(toMinify).minify()
            });
        }),

        //
        // We'll write the build stats to a file, just in case. In particular, 
        // your server-side code may read this file to detect the cached 
        // file name.
        //
        function() {
            this.plugin("done", stats => {
                fs.writeFileSync(
                    path.join(__dirname, "stats.json"),
                    JSON.stringify(stats.toJson()));
                });
          }
    ]
};

if (Elixir.cssPreprocessor) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        //
        // We'll keep things on the traditional side, and extract
        // all CSS to its own bundled file.
        //
        new ExtractTextPlugin(
            path.relative(
                Elixir.js.output.base, 
                Elixir.hash ? Elixir[Elixir.cssPreprocessor].output.hashedPath 
                            : Elixir[Elixir.cssPreprocessor].output.path
            )
        )
    ]);
}

//
// Certain plugins are only appropriate during production.
//
if (Elixir.inProduction) {
    module.exports.plugins = (module.exports.plugins || []).concat([
        // 
        // This will hunt down any occurrence of the 'process.env' string
        // and replace it with "production."
        // 
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),


        // 
        // Minification should only take place during production, 
        // since it's a time-consuming process.
        // 
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: { 
                warnings: false 
            }
        })
    ]);
}

//
// If the user wants Sass compilation, we'll add the necessary loader here.
//
if (Elixir.sass) {
    module.exports.module.rules.push({
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'sass-loader']
        })
    });
}


//
// If the user wants Less compilation, we'll add the necessary loader here.
//
if (Elixir.less) {
    module.exports.module.rules.push({
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
            fallbackLoader: 'style-loader',
            loader: ['css-loader', 'less-loader']
        })
    });
}
