'BaseObject+Indirect+Eventful'.subclass(function (I) {
  "use strict";
  // I describe a clock that ticks independently from real-time. 
  I.am({
    Service: true
  });
  I.know({
    // get current clock time
    get: function () {
      return this.$rt.getUptime();
    },
    // create event that fires after a delay in seconds
    delay: I.burdenSubclass
  });
})