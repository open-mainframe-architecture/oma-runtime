//@ An indirect object gets or computes something.
'Trait'.subclass(function (I) {
  "use strict";
  I.know({
    //@ Get whatever is behind this indirection.
    //@return {any} the designated thing
    get: I.burdenSubclass
  });
})