function configure(module) {
  "use strict";
  /*global Worker*/
  module.description = 'This module implements the common environment of web workers/browsers.';
  module.test = () => typeof Worker !== 'undefined';
}