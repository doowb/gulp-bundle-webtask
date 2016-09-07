'use strict';

var co = require('co');
var limiter = require('co-limiter');

var worker = require('./lib/worker');

module.exports = function(ctx, cb) {
  var limit = limiter(ctx.data.workers);
  co(function*() {
    return yield ctx.data.payloads.map(function(payload) {
      return limit(worker(payload));
    });
  })
  .then(function(result) {
    cb(null, result);
  }, cb);
};
