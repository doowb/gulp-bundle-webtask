'use strict';

require('mocha');
var path = require('path');
var gulp = require('gulp');
var assert = require('assert');
var bundle = require('../');

var fixtures = path.join.bind(path, __dirname, 'fixtures');

describe('gulp-bundle-webtask', function() {
  it('should export a function', function() {
    assert.equal(typeof bundle, 'function');
  });

  it('should bundle a simple project', function(cb) {
    gulp.src('index.js', {cwd: fixtures('simple')})
      .pipe(bundle())
      .on('data', function(file) {
        assert.equal(file.base, fixtures('simple/'));
        assert.equal(file.path, fixtures('simple/bundle.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });

  it('should bundle a project and use a custom filename', function(cb) {
    gulp.src('index.js', {cwd: fixtures('simple')})
      .pipe(bundle('main.js'))
      .on('data', function(file) {
        assert.equal(file.base, fixtures('simple/'));
        assert.equal(file.path, fixtures('simple/main.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });

  it('should bundle a complex project', function(cb) {
    gulp.src('index.js', {cwd: fixtures('complex')})
      .pipe(bundle())
      .on('data', function(file) {
        assert.equal(file.base, fixtures('complex/'));
        assert.equal(file.path, fixtures('complex/bundle.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });

  it('should bundle an es6 project', function(cb) {
    gulp.src('index.js', {cwd: fixtures('es6')})
      .pipe(bundle({babelify: true}))
      .on('data', function(file) {
        assert.equal(file.base, fixtures('es6/'));
        assert.equal(file.path, fixtures('es6/bundle.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });

  it('should bundle a project with built in npm modules', function(cb) {
    gulp.src('index.js', {cwd: fixtures('built-ins')})
      .pipe(bundle())
      .on('data', function(file) {
        assert.equal(file.base, fixtures('built-ins/'));
        assert.equal(file.path, fixtures('built-ins/bundle.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });

  it('should not minify a bundle when minify is false', function(cb) {
    gulp.src('index.js', {cwd: fixtures('simple')})
      .pipe(bundle({minify: false}))
      .on('data', function(file) {
        assert.equal(file.base, fixtures('simple/'));
        assert.equal(file.path, fixtures('simple/bundle.js'));
        assert.equal(file.contents.toString().indexOf('exports = module.exports;\n'), 0);
      })
      .once('error', cb)
      .once('end', cb);
  });
});
