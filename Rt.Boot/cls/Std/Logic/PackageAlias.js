'PackageField'.subclass(function (I) {
  "use strict";
  // I describes fields that resolve to another logical.
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    // resolution of this alias exposes logical substance, for example a nested class
    resolutionResult: function () {
      return this.getSubstance();
    }
  });
})