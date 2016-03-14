//@ A converter transforms items of decorated stream.
'Decorator'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Closure} convert item after reading from input stream
    inputConversion: null,
    //@{Std.Closure} convert item before writing to output stream
    outputConversion: null
  });
  I.know({
    //@param stream {Std.Stream} decorated stream
    //@param input {Std.Closure?} input conversion
    //@param output {Std.Closure?} output conversion
    build: function(stream, input, output) {
      I.$super.build.call(this, stream);
      this.inputConversion = input || I.returnArgument;
      this.outputConversion = output || I.returnArgument;
    }
  });
  I.play({
    read: function() {
      return this.decoratedStream.read().yields(function(it) {
        var conversion = this.inputConversion;
        return conversion(it);
      });
    },
    write: function(it) {
      var conversion = this.outputConversion;
      return this.decoratedStream.write(conversion(it));
    }
  });
})