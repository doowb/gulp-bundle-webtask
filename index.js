'use strict';

var path = require('path');
var find = require('find-pkg');
var through = require('through2');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var extend = require('extend-shallow');
var source = require('vinyl-source-stream');

module.exports = function(filepath, filename, options) {
  if (typeof filename === 'object') {
    options = filename;
    filename = 'bundle.js'
  };

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
