'Behavior'.subclass(function(I) {
  "use strict";
  // I describe how classes behave.
  I.am({
    Final: true
  });
  I.share({
    // metaclass package with package fields
    BehaviorPackage: I._.MetaclassPackage
  });
})