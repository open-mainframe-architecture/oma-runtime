function configure(module) {
  "use strict";
  module.description = 'This module implements a type system for JSON data values.';
  module.provides = {
    // default typespace for runtime system
    'Std.Data.Typespace': Provider => Provider.create()
  };
}