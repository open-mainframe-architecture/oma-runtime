//@ A failure is a situation where things have gone bad.
'BaseObject+Illustrative'.subclass(function(I) {
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
  I.know({
    //@param origin {Any} failure origin
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
    },
    createPortrait: function() {
      return {
        origin: I.portray(this.failureOrigin),
        reason: this.failureTrace.message,
        trace: this.failureTrace.stack.split('\n')
      };
    }
  });
})