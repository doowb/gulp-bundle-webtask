'use strict';

var foo = require('./lib/foo');
var bar = require('./lib/bar');

module.exports = function(ctx, cb) {
  foo();
  bar();
  cb();
};
