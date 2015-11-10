'Decorator'.subclass(function(I) {
  "use strict";
  // I describe streams that convert items between other streams.
  I.am({
    Abstract: false
  });
  I.have({
    // closure to convert item after reading from input stream
    inputConversion: null,
    // closure to convert item before writing to output stream
    outputConversion: null
  });
  I.know({
    build: function(stream, input, output) {
      I.$super.build.call(this, stream);
      this.inputConversion = input || I.returnArgument;
      this.outputConversion = output || I.returnArgument;
    }
  });
  I.play({
    read: function() {
      var conversion = this.inputConversion;
      return I.$superRole.read.call(this).completes(function(event) {
        return conversion(event.origin().get());
      });
    },
    write: function(it) {
      var conversion = this.outputConversion;
      return I.$superRole.write.call(this, conversion(it));
    }
  });
})