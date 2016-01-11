'PackageField'.subclass(function (I) {
  "use strict";
  // I describe a field that resolves to another logical.
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