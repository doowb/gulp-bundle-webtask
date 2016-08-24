'use strict';

var path = require('path');
var find = require('find-pkg');
var through = require('through2');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var extend = require('extend-shallow');
var source = require('vinyl-source-stream');

/**
 * Use [browserify][], [gulp-uglify][], and defaults for the browserify commandline `node` flag to bundle source code for a [webtask][]
 * task. This will exclude any npm modules that are already include on the webtask servers.
 *
 * ```js
 * gulp.task('bundle', function() {
 *   return bundle('index.js')
 *     .pipe(gulp.dest('dist'));
 * });
 * ```
 * @param  {String} `filepath` Source filepath for the entry point of the bundled application.
 * @param  {String} `filename` Filename to use when naming the bundled file. Defaults to `bundle.js`.
 * @param  {String} `options` Additional options to pass to [browserify][].
 * @param  {String} `options.cwd` Specify a `cwd` to use when resolving the `filepath` and as the base path for the `filename`. Defaults to `process.cwd()`.
 * @return {Stream} Returns a stream that can be piped to (as in the example).
 * @api public
 */

module.exports = function bundle(filepath, filename, options) {
  if (typeof filename === 'object') {
    options = filename;
    filename = 'bundle.js';
  }

  options = options || {};

  var pkg = require(find.sync(options.cwd || process.cwd()));
  var defaults = {
    standalone: pkg.name,
    browserField: false,
    builtins: false,
    commondir: false,
    insertGlobalVars: {
      process: undefined,
      global: undefined,
      'Buffer.isBuffer': undefined,
      Buffer: undefined
    }
  };

  var opts = extend({}, defaults, options);
  var cwd = opts.cwd || process.cwd();

  return browserify(path.resolve(cwd, filepath), opts)
    .exclude('request') // expand this
    .bundle()
    .pipe(source(filename, cwd))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(through.obj(function(file, enc, next) {
      file.contents = new Buffer('exports = module.exports;\n' + file.contents.toString());
      next(null, file);
    }));
};
