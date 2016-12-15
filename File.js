let path = require('path');
let fs = require('fs');
let uglify = require('uglify-js');
let UglifyCss = require('clean-css');

module.exports = class {
    /**
     * Create a new File instance.
     * 
     * @param  {string}  file
     */
    constructor(file) {
        this.file = file;
        this.fileType = path.parse(file).ext;
    }


    /**
     * Minify the file, if it is CSS or JS.
     */
    minify() {
        if (this.fileType === '.js') {
            this.write(uglify.minify(this.file));
        }

        if (this.fileType === '.css') {
            this.write(
                new UglifyCss().minify(this.read()).styles
            );
        }
    }


    /**
     * Read the file.
     */
    read() {
        return fs.readFileSync(this.file, { encoding: 'utf-8' });
    }


    /**
     * Write the given contents to the file.
     * 
     * @param  {string}  body
     */
    write(body) {
        fs.writeFileSync(this.file, body);
    }


    /**
     * Parse the file path into segments.
     */
    parsePath() {
        let outputSegments = path.parse(this.file);

        return {
            path: this.file,
            hashedPath: `${outputSegments.dir}/${outputSegments.name}.[hash]${outputSegments.ext}`,
            base: outputSegments.dir,
            file: outputSegments.base,
            hashedFile: `${outputSegments.name}.[hash]${outputSegments.ext}`,
            name: outputSegments.name,
            ext: outputSegments.ext
        };
    } 
};
