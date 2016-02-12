//@ A converter transforms items of decorated stream.
'Decorator'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Rt.Closure} convert item after reading from input stream
    inputConversion: null,
    //@{Rt.Closure} convert item before writing to output stream
    outputConversion: null
  });
  I.know({
    //@param stream {Std.Stream} decorated stream
    //@param input {Rt.Closure?} input conversion
    //@param output {Rt.Closure?} output conversion
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