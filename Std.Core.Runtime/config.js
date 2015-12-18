function configure(module) {
  "use strict";
  module.description = 'This module defines standard runtime services.';
  module.depends = ['Std.Core.Data.Standard', 'Std.Core.Theater'];
  module.datatype = {
    App: {
      Launch: {
        debug: 'Flag',
        image: 'App.Image',
        parameters: 'App.Parameters?',
      },
      Image: {
        bundles: '<string>',
        modules: '<App.Module>'
      },
      Module: {
        bundle: 'string',
        index: 'integer',
        optional: 'Flag',
        depends: '[string]'
      },
      Parameters: '<string>'
    }
  };
}