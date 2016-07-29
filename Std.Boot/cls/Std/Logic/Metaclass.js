//@ I describe how the class side of a class behaves.
'Behavior'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.know({
    getPackageClass: I.returnWith(I._.MetaclassPackage)
  });
})