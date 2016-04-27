//@ A synthesizer computes and consumes items with closures.
'BaseObject+Stream'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Closure} produce next item of input stream
    inputComputation: null,
    //@{Std.Closure} consume next item of output stream
    outputComputation: null
  });
  I.know({
    //@param input {Std.Closure} produce input
    //@param output {Std.Closure} consume output
    build: function(input, output) {
      I.$super.build.call(this);
      this.inputComputation = input;
      this.outputComputation = output;
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