'Trait'.subclass(function (I) {
  "use strict";
  // I describe indirections to get (or to compute) something.
  I.know({
    // get whatever is behind this indirection
    get: I.burdenSubclass
  });
})