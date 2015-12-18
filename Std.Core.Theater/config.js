function configure(module) {
  "use strict";
  module.description = 'This module implements the theater that schedules actors on stage.';
  module.provides = {
    'Std.Theater': function () { },
    'Std.Wait.Clock': function () { }
  };
}