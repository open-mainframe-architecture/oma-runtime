function configure(module) {
  "use strict";
  module.description = 'This module implements the theater that schedules actors on stage.';
  module.provides = {
    'Std.Theater': () => 'Std.Theater.Actor'.logic.getPrototype().$theater,
    'Std.Wait.Clock': () => 'Std.Theater.Actor'.logic.getPrototype().$theater.getClock()
  };
}