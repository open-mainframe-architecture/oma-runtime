'Trait'.subclass(function (I) {
  "use strict";
  // I describe an indirection to get (or to compute) something.
  I.know({
    // get whatever is behind this indirection
    get: I.burdenSubclass
  });
})