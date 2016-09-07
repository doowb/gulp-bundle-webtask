'use strict';

module.exports = function(payload) {
  return function*() {
    return yield wait(payload);
  };
};

function wait(payload) {
  return function(cb) {
    setTimeout(function() {
      console.log('returning:', payload.cargo);
      cb(null, payload.cargo);
    }, payload.timeout);
  };
}
