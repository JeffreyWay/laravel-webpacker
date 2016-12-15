let Elixir = require('laravel-webpacker');

Elixir.js('./resources/assets/js/app.js', './public/js/bundle.js', { vendor: ['vue', 'jquery'] })
      .sass('./resources/assets/sass/app.scss', './public/css/complete.css');

module.exports = Elixir;
