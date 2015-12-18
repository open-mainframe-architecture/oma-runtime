function configure(module) {
  "use strict";
  module.description = 'This module implements a type system for JSON data values.';
  module.provides = {
    'Std.Data': function (serviceClass) {
      return serviceClass.create();
    }
  };
}