function configure(module) {
  "use strict";
  /*global window,console*/
  module.description = 'This module implements core services for a web browser environment.';
  module.depends = ['Std.Core.Web'];
  module.requires = {
    system: 'Std.Runtime.System'
  };
  module.test = function() {
    return typeof window !== 'undefined' && typeof console !== 'undefined';
  };
  module.init = function(required) {
    required.system.addLogger(console.warn.bind(console));
  };
  module.provides = {
    'Std.Runtime.BrowserConstants': function(serviceClass) {
      return serviceClass.create();
    }
  };
}