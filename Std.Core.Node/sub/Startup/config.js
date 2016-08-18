function configure(module) {
  "use strict";
  module.description = 'This module initiates startup in a Node.js process.';
  module.requires = {
    constants: 'Std.Runtime.Constants'
  };
  module.test = required => !required.constants.parentEmitter;
}