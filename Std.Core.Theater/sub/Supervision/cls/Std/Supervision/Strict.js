//@ Strict supervision kills actors after they cause an error.
'BaseObject+Manager'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
})