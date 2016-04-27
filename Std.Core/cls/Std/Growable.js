//@ A growable object grows when things are added.
'Trait'.subclass(I => {
  "use strict";
  I.know({
    //@ Add things to let it grow. This may be destructive.
    //@param ... {any} things to add
    //@return {Std.Growable} this receiver or a new growable object
    add: I.burdenSubclass
  });
})