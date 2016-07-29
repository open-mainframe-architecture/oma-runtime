function configure(module) {
  "use strict";
  module.description = 'This module implements the runtime environment of a web browser.';
  module.requires = {
    loose: 'Std.Management.Loose'
  };
  module.provides = {
    'Std.Runtime.Environment with Std.Runtime.Environment.WebBrowser': (Provider, required) =>
      Provider.spawn(required.loose)
  };
}