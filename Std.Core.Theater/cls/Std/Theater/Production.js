//@ A theater production propels progress.
'Trait'.subclass(I => {
  "use strict";
  I.know({
    //@ Successful production propels future progress. A failure is thrown on stage.
    //@param progress {any|Std.Closure} plain or computed progress of successful result
    //@return {Std.Theater.Showstopper} showstopper event to block a scene
    propels: I.burdenSubclass
  });
})