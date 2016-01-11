'BaseObject+Stream'.subclass(function (I) {
  "use strict";
  // I describe a stream that delegate item production and consumption to closures.
  I.am({
    Abstract: false
  });
  I.have({
    // closure to produce next item of input stream
    inputComputation: null,
    // closure to consume next item of output stream
    outputComputation: null
  });
  I.know({
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