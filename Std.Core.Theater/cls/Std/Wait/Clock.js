//@ A clock creates events that fire after some time has passed.
'Object'.subclass(I => {
  "use strict";
  I.know({
    //@ Create event that fires after a delay in seconds.
    //@param delay {number} number of seconds to delay after charging
    //@return {Std.Event} clock event
    delay: I.burdenSubclass,
    //@ Create event that fires when some deadline passes.
    //@param until {number} clock time when this event should fire
    //@return {Std.Event} clock event
    wait: I.burdenSubclass
  });
})