//@ A filter selects items to read from and write to a decorated stream.
'Decorator'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Rt.Closure} select items for input stream
    inputSelection: null,
    //@{Rt.Closure} select items for output stream
    outputSelection: null
  });
  I.know({
    //@param decorator {Std.Stream} decorated stream
    //@param input {Rt.Closure} input selection
    //@param output {Rt.Closure} output selection
    build: function (stream, input, output) {
      I.$super.build.call(this, stream);
      var self = this, selectInput = input || I.returnTrue;
      this.inputSelection = function(ignition) {
        var it = ignition.origin().get();
        return selectInput(it) ? it : self.$agent.read();
      };
      this.outputSelection = output || I.returnTrue;
    }
  });
  I.play({
    read: function () {
      return this.decoratedStream.read().completion().triggers(this.inputSelection);
    },
    write: function (it) {
      var selection = this.outputSelection;
      if (selection(it)) {
        return this.decoratedStream.write(it);
      }
    }
  });
})