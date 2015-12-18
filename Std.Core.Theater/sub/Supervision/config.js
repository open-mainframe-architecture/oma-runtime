function configure(module) {
  "use strict";
  module.description = 'This module defines standard supervisors in a theater.';
  module.requires = {
    director: 'Std.Theater.Director'
  };
  module.provides = {
    'Std.Supervision.Loose': function (roleClass, required) {
      return roleClass.spawn(required.director);
    },
    'Std.Supervision.Strict': function (roleClass, required) {
      return roleClass.spawn(required.director);
    }
  };
}