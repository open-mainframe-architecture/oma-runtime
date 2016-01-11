function configure(module) {
  "use strict";
  module.description = 'This module implements the theater that schedules actors on stage.';
  module.provides = {
    // for documentation purposes only (see Std.Theater.Service)
    'Std.Theater': function () { },
    'Std.Wait.Clock': function () { }
  };
}