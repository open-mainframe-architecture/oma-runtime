//@ A filter selects items to read from and write to a decorated stream.
'Decorator'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Closure} select items for input stream
    inputSelection: null,
    //@{Std.Closure} select items for output stream
    outputSelection: null
  });
  I.know({
    //@param decorator {Std.Stream} decorated stream
    //@param input {Std.Closure} input selection
    //@param output {Std.Closure} output selection
    build: function(stream, input, output) {
      I.$super.build.call(this, stream);
      this.inputSelection = input || I.returnTrue;
      this.outputSelection = output || I.returnTrue;
    }
  });
  I.play({
    read: function() {
      return this.decoratedStream.read().yields(function(it) {
        var selection = this.inputSelection;
        return selection(it) ? it : this.$agent.read();
      });
    },
    write: function(it) {
      var selection = this.outputSelection;
      if (selection(it)) {
        return this.decoratedStream.write(it);
      }
    }
  });
})