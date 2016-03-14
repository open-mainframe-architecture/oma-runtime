//@ An alias resolves to another logical.
'Field'.subclass(function(I) {
  "use strict";
  I.know({
    resolutionResult: function() {
      // resolution of this alias exposes logical substance, for example a nested class
      return this.getSubstance();
    }
  });
})