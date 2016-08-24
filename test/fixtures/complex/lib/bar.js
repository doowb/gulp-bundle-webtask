'use strict';

var baz = require('./baz');
module.exports = function() {
  console.log(__filename);
  baz();
};
