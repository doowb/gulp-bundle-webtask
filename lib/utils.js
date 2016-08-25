'use strict';

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('browserify');
require('data-store', 'Store');
require('date-store', 'Dates');
require('extend-shallow', 'extend');
require('find-pkg', 'find');
require('gulp-uglify', 'uglify');
require('simple-get', 'get');
require('through2', 'through');
require('vinyl-buffer', 'buffer');
require('vinyl-source-stream', 'source');
require = fn;


utils.getModules = function(cb) {
  var store = new utils.Store();
  var dates = new utils.Dates('gulp-bundle-webtask');
  if (dates.lastSaved('modules').lessThan('1 day ago')) {
    cb(null, store.get('modules').modules);
    return;
  }

  var url = 'https://webtask.it.auth0.com/api/run/wt-tehsis-gmail_com-1?key=eyJhbGciOiJIUzI1NiIsImtpZCI6IjIifQ.eyJqdGkiOiJmZGZiOWU2MjQ0YjQ0YWYyYjc2YzAwNGU1NjgwOGIxNCIsImlhdCI6MTQzMDMyNjc4MiwiY2EiOlsiZDQ3ZDNiMzRkMmI3NGEwZDljYzgwOTg3OGQ3MWQ4Y2QiXSwiZGQiOjAsInVybCI6Imh0dHA6Ly90ZWhzaXMuZ2l0aHViLmlvL3dlYnRhc2tpby1jYW5pcmVxdWlyZS90YXNrcy9saXN0X21vZHVsZXMuanMiLCJ0ZW4iOiIvXnd0LXRlaHNpcy1nbWFpbF9jb20tWzAtMV0kLyJ9.MJqAB9mgs57tQTWtRuZRj6NCbzXxZcXCASYGISk3Q6c';
  utils.get.concat(url, function(err, res, data) {
    if (err) return cb(err);
    try {
      data = JSON.parse(data);
      store.set('modules', data);
      dates.set('modules');
      cb(null, data.modules);
      return;
    } catch (err) {
      cb(err);
    }
  });
};
/**
 * Expose `utils` modules
 */

module.exports = utils;
