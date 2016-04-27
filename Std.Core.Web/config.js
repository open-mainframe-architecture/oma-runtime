function configure(module) {
  "use strict";
  /*global MessageChannel,XMLHttpRequest*/
  module.description = 'This module implements what web browsers and workers have in common.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.test = () => typeof MessageChannel !== 'undefined' &&
    typeof XMLHttpRequest !== 'undefined';
  module.provides = {
    'Std.HTTP.WebClient': (roleClass, required) => roleClass.spawn(required.loose)
  };
}