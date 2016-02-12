//@ A clock ticks independently from real-time.
'BaseObject+Indirect+Eventful'.subclass(function (I) {
  "use strict";
  I.am({
    Service: true
  });
  I.know({
    //@ Obtain current clock time.
    //@return {number} uptime of runtime system in seconds
    get: function () {
      return this.$rt.getUptime();
    },
    //@ Create event that fires after a delay in seconds.
    //@param delay {number} number of seconds to delay after charging
    //@return {Std.FullEvent} delay event from this origin
    delay: I.burdenSubclass
  });
})