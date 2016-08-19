//@ A blooper is a cue that signals an asynchronous error. A blooper is a child of a showstopper.
'Cue'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{error?} asynchronous error
    asynchronousError: null
  });
  I.know({
    charge: function(parent) {
      I.$super.charge.call(this, parent);
      if (this.asynchronousError) {
        // fire immediately if this blooper already failed while charging
        return this;
      }
    },
    isBlooper: I.returnTrue,
    //@ Get asynchronous error that has been captured by this blooper.
    //@return {error?} asynchronous error or nothing
    getError: function() {
      return this.asynchronousError;
    },
    //@ Test whether this blooper has captured an asynchronous error.
    //@return {boolean} true if this blooper has captured an error, otherwise false
    isMistake: function() {
      return !!this.asynchronousError;
    },
    //@ Capture asynchronous error.
    //@param error {error|*} existing exception or error message
    //@return nothing
    mistake: function(error) {
      if (!this.asynchronousError) {
        this.asynchronousError = I.threw(error);
        // if this cue is not yet charged, firing it is a safe no-op
        this.fire();
      }
    }
  });
})