//@ An abstract theater event is a unique, onetime occasion on stage.
'BaseObject'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ Fire ignition to announce the occasion.
    //@param ignition {Std.Event?} event that fired
    //@param fromChild {Std.Event?} event that propagated ignition
    //@return nothing
    fire: I.burdenSubclass
  });
})