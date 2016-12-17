let Elixir = require('laravel-webpacker');

Elixir.js('./resources/assets/js/app.js', './public/js/bundle.js')
      .sass('./resources/assets/sass/app.scss', './public/css/complete.css');

// Full API
// Elixir.js(src, output);
// Elixir.extract(vendorLibs);
// Elixir.sass(src, output);
// Elixir.less(src, output);
// Elixir.combine(files, destination);
// Elixir.copy(from, to);
// Elixir.minify(file);
// Elixir.sourceMaps(); // Enable sourcemaps
// Elixir.version({ manifest: './path.json' }); // Enable versioning.
// Elixir.disableNotifications();

module.exports = Elixir;
