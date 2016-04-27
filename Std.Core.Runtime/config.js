function configure(module) {
  "use strict";
  module.description = 'This module defines the runtime environment and associated datatypes.';
  module.depends = ['Std.Core.Data.Types'];
  module.datatypes = {
    // plain byte size or record with asset info
    'Library.AssetInfo': 'integer|Library.Asset',
    'Library.Asset': {
      // byte size
      size: 'integer',
      // data URI if binary asset is small enough
      data64: 'string?',
      // pixel dimension of large graphics image
      pixel: 'Area?'
    },
    'Runtime.Image': {
      // constants of library service
      constants: {
        // basename of archive and bundle files
        basename: { archive: 'string', bundle: 'string' },
        // directory where archives are preserved
        preserve: 'string',
        // directory where bundles are published
        publish: 'string'
      },
      // specify versions of source archives in runtime image
      archives: '<string>',
      // map bundles to their release identities
      bundles: '<string>',
      // available modules in runtime image
      modules: '<Runtime.Module>',
      // location of heavy archive and bundle (relative to mainframe root)
      heavy: 'string?'
    },
    'Runtime.Module': {
      // bundle that distributes module (leave empty for heavy bundle)
      bundle: 'string',
      // oridinal position of module in bundle distribution
      ordinal: 'integer',
      // an optional module includes a test to check whether it should load
      optional: 'Flag',
      // explicit module dependencies
      depends: 'Maybe([string])'
    }
  };
}