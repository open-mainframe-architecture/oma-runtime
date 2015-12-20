function configure(module) {
  "use strict";
  module.description = 'This module defines standard runtime services.';
  module.depends = ['Std.Core.Data.Standard', 'Std.Core.Theater'];
  module.datatype = {
    App: {
      URL: {
        wwww: 'string',
        sop: 'string'
      },
      Launch: {
        debug: 'Flag',
        image: 'App.Image'
      },
      Image: {
        archives: '<App.URL>',
        bundles: '<App.Bundle>',
        modules: '<App.Module>'
      },
      Bundle: {
        home: 'App.URL',
        release: '<string>'
      },
      Module: {
        bundle: 'string',
        index: 'integer',
        optional: 'Flag',
        depends: '[string]'
      }
    }
  };
}