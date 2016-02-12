//@ A synthesizer computes and consumes items with closures.
'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Rt.Closure?} produce next item of input stream
    inputComputation: null,
    //@{Rt.Closure?} consume next item of output stream
    outputComputation: null
  });
  I.know({
    //@param input {Rt.Closure?} produce input
    //@param output {Rt.Closure?} consume output
    build: function (input, output) {
      I.$super.build.call(this);
      this.inputComputation = input;
      this.outputComputation = output;
    }
  });
  I.peek({
    isReadable: function () {
      return !!this.inputComputation;
    },
    isWritable: function () {
      return !!this.outputComputation;
    }
  });
  I.play({
    read: function () {
      var computation = this.inputComputation;
      return computation();
    },
    write: function (it) {
      var computation = this.outputComputation;
      return computation(it);
    }
  });
})