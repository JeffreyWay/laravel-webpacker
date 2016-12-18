let Elixir = require('laravel-webpacker');


Elixir.mix(function (mix) {
    mix.js('./src/app.js', './dist/app.js')
       .sass('./src/app.scss', './dist/app.css');
});

// Full API
// Elixir.js(src, output);
// Elixir.extract(vendorLibs);
// Elixir.sass(src, output);
// Elixir.less(src, output);
// Elixir.combine(files, destination);
// Elixir.copy(from, to);
// Elixir.minify(file);
// Elixir.sourceMaps(); // Enable sourcemaps
// Elixir.version(); // Enable versioning.
// Elixir.disableNotifications();
// Elixir.setCacheDirectory('some/folder');

module.exports = Elixir;
