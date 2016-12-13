let path = require('path');
let fs = require('fs');
var uglify = require('uglify-js');
var UglifyCss = require('clean-css');

let Elixir = {
	inProduction: process.env.NODE_ENV === 'production',
	sourcemaps: false,
	cssPreprocessor: null,
	hash: false
};

Elixir.File = class {
	constructor(file) {
		this.file = file;
		this.fileType = path.parse(file).ext;
	}

	minify() {
		if (this.fileType === '.js') {
			fs.writeFileSync(
				this.path,
				uglify.minify(this.file)
			);
		}

		if (this.fileType === '.css') {
			let css = new UglifyCss().minify(
				fs.readFileSync(this.file, { encoding: 'utf-8' })
			).styles;

			fs.writeFileSync(this.file, css);
		}
	}
};

module.exports = {
	/**
	 * Register the Webpack entry/output paths.
	 * 
	 * @param  {mixed}   entry  
	 * @param  {string}  output 
	 */
	js(entry, output) {
		let outputSegments = path.parse(output);

		Elixir.js = {
			entry: entry,
			output: {
				path: output,
				hashedPath: `${outputSegments.dir}/${outputSegments.name}.[hash]${outputSegments.ext}`,
				base: outputSegments.dir,
				file: outputSegments.base,
				hashedFile: `${outputSegments.name}.[hash]${outputSegments.ext}`
			},
		};

		return this;
	},


	/**
	 * Register Sass compilation.
	 * 
	 * @param  {string}  src  
	 * @param  {string}  output 
	 */
	sass(src, output) {
		let outputSegments = path.parse(output);

		Elixir.sass = {
			src: src,
			output: {
				path: output,
				hashedPath: `${outputSegments.dir}/${outputSegments.name}.[hash]${outputSegments.ext}`,
				base: outputSegments.dir,
				file: outputSegments.base,
				name: outputSegments.name,
				ext: outputSegments.ext
			}
		};

		Elixir.cssPreprocessor = 'sass';

		return this;
	},


	/**
	 * Register Less compilation.
	 * 
	 * @param  {string}  src  
	 * @param  {string}  output 
	 */
	less(src, output) {
		let outputSegments = path.parse(output);

		Elixir.less = {
			src: src,
			output: {
				path: output,
				hashedPath: `${outputSegments.dir}/${outputSegments.name}.[hash]${outputSegments.ext}`,
				base: outputSegments.dir,
				file: outputSegments.base,
				name: outputSegments.name,
				ext: outputSegments.ext
			}
		};

		Elixir.cssPreprocessor = 'less';

		return this;
	},


	/**
	 * Combine a collection of files.
	 * 
	 * @param  {string|array}  src  
	 * @param  {string}        output 
	 */
	combine(src, output) {
		Elixir.combine = (Elixir.combine || []).concat({
			src: src,
			output: output
		});

		return this;
	},


	/**
	 * Enable sourcemap support.
	 */
	sourceMaps() {
		Elixir.sourcemaps = true;

		return this;
	},


	/**
	 * Enable compiled file versioning.
	 */
	version() {
		Elixir.hash = true;

		return this;
	}
};

module.exports.tasks = Elixir;
