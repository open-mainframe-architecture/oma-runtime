//@ A failure is a situation where things have gone bad.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Any} object from where this failure originates
    failureOrigin: null,
    //@{[any]} array with generic reasons for this failure
    failureReasons: null,
    //@{Rt.Exception} exception with stack trace of failure creation
    failureTrace: null
  });
  I.know({
    //@param origin {Any} failure origin
    //@param reasons {[any]} failure reasons
    build: function (origin, reasons) {
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