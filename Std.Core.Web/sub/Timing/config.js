function configure(module) {
  "use strict";
  /*global performance*/
  module.description = 'This module improves the runtime system with accurate timing.';
  module.test = () => typeof performance !== 'undefined';
}