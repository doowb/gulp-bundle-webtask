'use strict';

var utils = require('./lib/utils');

/**
 * Use [browserify][], [gulp-uglify][], and defaults for the browserify commandline `node` flag to bundle source code for a [webtask][]
 * task. This will exclude any npm modules that are already include on the webtask servers.
 *
 * ```js
 * gulp.task('bundle', function() {
 *   return gulp.src('index.js')
 *     .pipe(bundle())
 *     .pipe(gulp.dest('dist'));
 * });
 * ```
 * @param  {String} `filename` Optional filename to use when naming the bundled file. Defaults to `bundle.js`.
 * @param  {String} `options` Additional options to pass to [browserify][].
 * @param  {Boolean} `options.minify` Disable minification by setting this option to `false`. Defaults to `true`.
 * @param  {Boolean|Object} `options.babelify` When set to `true`, uses [babelify][]. Set as an object to pass custom options to the [babelify][] transform. Defaults to `false`.
 * @return {Stream} Returns a stream that can be piped to (as in the example).
 * @api public
 */

module.exports = function bundle(filename, options) {
  if (typeof filename === 'object') {
    options = filename;
    filename = null;
  }

  filename = filename || 'bundle.js';
  options = options || {};

  var pkg = require(utils.find.sync(options.cwd || process.cwd()));
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

  var opts = utils.extend({}, defaults, options);
  var babelifyOpts = {
    global: true,
    presets: ['es2015']
  };

  var filepath, base, excluded;
  return utils.through.obj(function(file, enc, cb) {
    filepath = file.path;
    base = file.base;
    utils.getModules(function(err, modules) {
      if (err) return cb(err);
      excluded = modules.filter(function(mod) {
        return mod.version !== 'native';
      }).map(function(mod) {
        return mod.name;
      });
      cb();
    });
  }, function(cb) {
    var res = null;
    var stream = this;

    // create browserify instance
    var b = utils.browserify(filepath, opts);

    // exclude modules included with webtask
    b = excluded.reduce(function(acc, mod) {
      acc.exclude(mod);
      return acc;
    }, b);

    if (options.babelify) {
      b.transform('babelify', typeof options.babelify === 'object' ? options.babelify : babelifyOpts);
    }

    // bundle
    b.bundle()
      .pipe(utils.source(filename, base))
      .pipe(utils.buffer())
      .pipe(options.minify === false ? utils.through.obj() : utils.uglify())
      .pipe(utils.through.obj(function(file, enc, next) {
        file.contents = new Buffer('exports = module.exports;\n' + file.contents.toString());
        res = file;
        next(null, file);
      }))
      .on('data', function() {})
      .on('end', function() {
        stream.push(res);
        cb();
      });
  });
};
