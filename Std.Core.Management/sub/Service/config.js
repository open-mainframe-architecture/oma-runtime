function configure(module) {
  "use strict";
  module.description = 'This module defines standard managers in a theater.';
  module.requires = {
    director: 'Std.Theater.Director'
  };
  module.provides = {
    'Std.Management.Loose': (roleClass, required)  => roleClass.spawn(required.director),
    'Std.Management.Strict': (roleClass, required) => roleClass.spawn(required.director)
  };
}