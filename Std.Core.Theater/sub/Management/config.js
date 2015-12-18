function configure(module) {
  "use strict";
  module.description = 'This module defines management roles in a theater.';
  module.provides = {
    'Std.Theater.Director': function (roleClass) {
      return roleClass.spawn();
    }
  };
}