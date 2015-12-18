'Decorator'.subclass(function (I) {
  "use strict";
  // I describe streams that convert items of other streams.
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
    build: function (stream, input, output) {
      I.$super.build.call(this, stream);
      var conversion = input || I.returnArgument;
      this.inputConversion = function (ignition) {
        var it = ignition.origin().get();
        return conversion(it);
      };
      this.outputConversion = output || I.returnArgument;
    }
  });
  I.play({
    read: function () {
      return this.decoratedStream.read().completion().triggers(this.inputConversion);
    },
    write: function (it) {
      var conversion = this.outputConversion;
      return this.decoratedStream.write(conversion(it));
    }
  });
})