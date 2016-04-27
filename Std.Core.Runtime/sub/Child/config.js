function configure(module) {
  "use strict";
  module.description = 'This module adds functionality to child environments.';
  module.requires = {
    constants: 'Std.Runtime.Constants'
  };
  // this is a child environment, if there is an emitter to communicate with the parent
  module.test = required => !!required.constants.parentEmitter;
}