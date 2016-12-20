let Alchemy = require('laravel-webpacker');

module.exports = Alchemy.mix(mix => {
    mix.js('src/app.js', 'dist/app.js');
       .sass('src/app.scss', 'dist/app.scss');
});

// Full API
// mix.js(src, output);
// mix.extract(vendorLibs);
// mix.sass(src, output);
// mix.less(src, output);
// mix.combine(files, destination);
// mix.copy(from, to);
// mix.minify(file);
// mix.sourceMaps(); // Enable sourcemaps
// mix.version(); // Enable versioning.
// mix.disableNotifications();
// mix.setCacheDirectory('some/folder');
