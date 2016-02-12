//@ A package alias resolves to another logical.
'PackageField'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    resolutionResult: function () {
      // resolution of this alias exposes logical substance, for example a nested class
      return this.getSubstance();
    }
  });
})