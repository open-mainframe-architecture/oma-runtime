function configure(module) {
  "use strict";
  module.description = 'This module defines standard managers in a theater.';
  module.requires = {
    director: 'Std.Theater.Director'
  };
  module.provides = {
    'Std.Management.Loose': (Provider, required) => Provider.spawn(required.director),
    'Std.Management.Strict': (Provider, required) => Provider.spawn(required.director)
  };
}