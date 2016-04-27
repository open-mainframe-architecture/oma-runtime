function configure(module) {
  "use strict";
  /*global window,console*/
  module.description = 'This module implements core services for a web browser environment.';
  module.depends = ['Std.Core.Web'];
  module.test = () => typeof window !== 'undefined' && typeof console !== 'undefined';
  module.provides = {
    'Std.Runtime.BrowserConstants': serviceClass => serviceClass.create()
  };
}