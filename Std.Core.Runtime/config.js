function configure(module) {
  "use strict";
  module.description = 'This module defines standard runtime services.';
  module.depends = ['Std.Core.Data.Types'];
  module.datatypes = {
    App: {
      Image: {
        // URL of mainframe root where public libary is located
        library: 'string?',
        // specify versions of source archives in application image
        versions: '<string>',
        // map bundles to their release identities
        bundles: '<string>',
        // heavy archive and bundle with module replacements and additions
        heavy: 'App.Heavy?',
        // available modules in application image
        modules: '<App.Module>'
      },
      Heavy: {
        // URL of archive with source assets of heavy modules
        archive: 'string',
        // bundle directory with published assets of heavy modules
        bundle: 'string'
      },
      Module: {
        // bundle that distributes module (leave empty for heavy module)
        bundle: 'string',
        // index of module in bundle distribution
        index: 'integer',
        // an optional module includes a test to check whether it should load
        optional: 'Flag',
        // explicit module dependencies
        depends: 'Maybe([string])'
      }
    }
  };
}