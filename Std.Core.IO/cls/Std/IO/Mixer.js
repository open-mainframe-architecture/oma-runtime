//@ A mixer delegates reading and writing to other streams.
'BaseObject+Stream'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Stream?} input side of this mixer
    inputStream: null,
    //@{Std.Stream?} output side of this mixer
    outputStream: null
  });
  I.know({
    //@param input {Std.Stream?} input stream to mix
    //@param output {Std.Stream?} output stream to mix
    build: function(input, output) {
      I.$super.build.call(this);
      this.inputStream = input;
      this.outputStream = output;
    }
  });
  I.play({
    read: function() {
      return this.inputStream.read();
    },
    write: function(it) {
      return this.outputStream.write(it);
    }
  });
})