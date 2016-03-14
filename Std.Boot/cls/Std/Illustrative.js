//@ An illustrative object can portray itself.
'Trait'.subclass(function(I) {
  "use strict";
  I.know({
    //@ Create object with illustrative properties of receiver.
    //@return @{Object} new object
    createPortrait: I.burdenSubclass
  });
})