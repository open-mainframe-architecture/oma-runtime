'Event'.subclass(function (I) {
  "use strict";
  // I describe a blooper event that captures an asynchronous failure.
  I.have({
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
    fail: function (origin) {
      if (!this.asynchronousFailure) {
        this.failAll(origin, I.slice(arguments, 1));
      }
    },
    failAll: function (origin, reasons) {
      if (!this.asynchronousFailure) {
        this.failWith(I._.Failure.create(origin, reasons));
      }
    },
    failWith: function (failure) {
      if (!this.asynchronousFailure) {
        this.asynchronousFailure = failure;
        // if this event is not yet charged, firing it is a safe no-op
        this.fire();
      }
    },
    getFailure: function () {
      return this.asynchronousFailure;
    }
  });
})