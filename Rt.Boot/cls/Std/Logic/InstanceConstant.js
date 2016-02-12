//@ A constant field defines immutable data for objects.
'InstanceField'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
})