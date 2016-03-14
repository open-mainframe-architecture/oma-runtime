function configure(module) {
  "use strict";
  module.description = 'This module defines standard managers in a theater.';
  module.requires = {
    director: 'Std.Theater.Director'
  };
  module.provides = {
    'Std.Management.Loose': function(roleClass, required) {
      return roleClass.spawn(required.director);
    },
    'Std.Management.Strict': function(roleClass, required) {
      return roleClass.spawn(required.director);
    }
  };
}