function configure(module) {
  "use strict";
  module.description = 'This module defines standard runtime services.';
  module.depends = ['Std.Core.Data.Types'];
  module.datatypes = {
    App: {
      // byte size or record with extended info
      AssetInfo: 'integer|App.Asset',
      Asset: {
        // byte size
        size: 'integer',
        // data URI if binary asset is small enough
        data64: 'string?',
        // pixel dimension of large graphics image
        px: 'Pixel?'
      },
      Image: {
        // release identity of regular, light image
        identity: 'string?',
        // URL of mainframe root where public libary is located
        library: 'string?',
        // constants of library service
        constants: {
          // basename of archive and bundle files
          basename: { archive: 'string', bundle: 'string' },
          // directory where archives are preserved
          preserve: 'string',
          // directory where bundles are published
          publish: 'string',
          // name of runtime archive/bundle
          runtime: 'string'
        },
        // location of heavy archive and bundle
        heavy: 'string?',
        // specify versions of source archives in application image
        archives: '<string>',
        // map bundles to their release identities
        bundles: '<string>',
        // available modules in application image
        modules: '<App.Module>'
      },
      Module: {
        // bundle that distributes module (leave empty for heavy bundle)
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