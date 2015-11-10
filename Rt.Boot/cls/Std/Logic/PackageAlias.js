'PackageField'.subclass(function(I) {
  "use strict";
  // I describes fields that resolve to another logical.
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    resolution: function() {
      // resolution of this alias exposes logical substance, for example a nested class
      return this.getSubstance();
    }
  });
})