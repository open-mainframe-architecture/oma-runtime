'BaseObject'.subclass(function(I) {
  "use strict";
  // I describe situations where things have gone bad.
  I.have({
    // object where this failure originates
    failureOrigin: null,
    // array with generic reasons (strings, number, objects, etc.) for this failure
    failureReasons: null,
    // exception with stack trace of failure creation
    failureTrace: null
  });
  I.know({
    build: function(origin, reasons) {
      I.$super.build.call(this);
      this.failureOrigin = origin;
      this.failureReasons = reasons;
      try {
        throw new Error();
      } catch (trace) {
        this.failureTrace = trace;
      }
    }
  });
})