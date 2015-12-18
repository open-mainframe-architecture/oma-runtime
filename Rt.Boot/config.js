function configure(module) {
  "use strict";
  module.description = 'This module boots a bare runtime system that can load more modules.';
  module.provides = {
    'Rt.System': function () { }
  };
}