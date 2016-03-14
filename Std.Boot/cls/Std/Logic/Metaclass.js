//@ I describe how the class side of a class behaves.
'Behavior'.subclass(function(I) {
  "use strict";
  I.am({
    Final: true
  });
  I.share({
    //@{Std.Logic.MetaclassPackage.$} metaclass package with package fields
    BehaviorPackage: I._.MetaclassPackage
  });
})