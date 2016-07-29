//@ A synthesizer computes and consumes items with closures.
'Stream'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{function} produce next item of input stream
    inputComputation: null,
    //@{function} consume next item of output stream
    outputComputation: null
  });
  I.know({
    //@param input {*|function} produce input
    //@param output {function?} consume output
    build: function(input, output) {
      I.$super.build.call(this);
      this.inputComputation = I.isClosure(input) ? input : I.returnWith(input);
      this.outputComputation = output || I.doNothing;
    }
  });
  I.play({
    read: function() {
      const computation = this.inputComputation;
      return computation();
    },
    write: function(it) {
      const computation = this.outputComputation;
      return computation(it);
    }
  });
})