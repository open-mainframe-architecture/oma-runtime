function configure(module) {
  "use strict";
  module.description = 'This module implements the common environment of web workers/browsers.';
  module.test = function() {
    return typeof Worker !== 'undefined';
  };
}