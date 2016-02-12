//@ A blooper event captures an asynchronous failure.
'Event'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Failure|Rt.Exception} asynchronous failure or exception
    asynchronousFailure: null
  });
  I.know({
    charge: function (parent) {
      I.$super.charge.call(this, parent);
      if (this.asynchronousFailure) {
        // fire immediately if this blooper already failed
        return this;
      }
    },
    //@ Capture failure from origin with unknown reasons.
    //@param origin {any} JavaScript object or value
    //@param ... {any} failure reason
    //@return nothing
    fail: function (origin) {
      if (!this.asynchronousFailure) {
        this.failAll(origin, I.slice(arguments, 1));
      }
    },
    //@ Capture failure from origin with specified reasons.
    //@param origin {any} JavaScript object or value
    //@param reasons {[any]} failure reasons
    //@return nothing
    failAll: function (origin, reasons) {
      if (!this.asynchronousFailure) {
        this.failWith(I._.Failure.create(origin, reasons));
      }
    },
    //@ Capture asynchronous failure.
    //@param failure {Std.Failure|Rt.Exception} failure/exception to capture
    //@return nothing
    failWith: function (failure) {
      if (!this.asynchronousFailure) {
        this.asynchronousFailure = failure;
        // if this event is not yet charged, firing it is a safe no-op
        this.fire();
      }
    },
    //@ Get asynchronous failure that has been captured by this blooper.
    //@return {Std.Failure|Rt.Exception?} asynchronous failure/exception or nothing
    getFailure: function () {
      return this.asynchronousFailure;
    }
  });
})