function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a web browser.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Environment.WebBrowser': (roleClass, required) => roleClass.spawn(required.loose)
  };
}