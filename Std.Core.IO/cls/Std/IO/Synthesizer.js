//@ A synthesizer produces and consumes items with closures.
'Stream'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{function} produce next item of input stream
    inputProduction: null,
    //@{function} consume next item of output stream
    outputConsumption: null
  });
  I.know({
    //@param input {*|function} produce input
    //@param output {function?} consume output
    build: function(input, output) {
      I.$super.build.call(this);
      this.inputProduction = I.isClosure(input) ? input : I.returnWith(input);
      this.outputConsumption = output || I.doNothing;
    }
  });
  I.play({
    read: function() {
      const computation = this.inputProduction;
      return computation();
    },
    write: function(it) {
      const computation = this.outputConsumption;
      return computation(it);
    }
  });
})