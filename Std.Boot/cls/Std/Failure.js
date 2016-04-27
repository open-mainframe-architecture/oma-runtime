//@ A failure is a situation where things have gone bad.
'BaseObject'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{any} JavaScript object or value from where this failure originates
    failureOrigin: null,
    //@{Std.Runtime.Exception} exception with stack trace of failure
    failureTrace: null
  });
  I.access({
    //@{string} get textual reason of this failure
    reason: function() {
      return this.failureTrace.message;
    },
    //@{[string]} get environment-specific stack trace of this failure
    trace:function() {
      return this.failureTrace.stack.split('\n');
    }
  });
  I.know({
    //@param origin {any} failure origin
    //@param reason {any|Std.Runtime.Exception} failure reason or existing failure trace
    build: function(origin, reason) {
      I.$super.build.call(this);
      this.failureOrigin = origin;
      if (reason instanceof Error) {
        this.failureTrace = reason;
      } else {
        try {
          throw new Error(reason);
        } catch (caught) {
          this.failureTrace = caught;
        }
      }
    }
  });
})