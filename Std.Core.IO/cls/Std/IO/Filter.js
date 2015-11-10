'Decorator'.subclass(function(I) {
  "use strict";
  // I describe streams that filter items between other streams.
  I.am({
    Abstract: false
  });
  I.have({
    // closure to select items for input stream
    inputSelection: null,
    // closure to select items for output stream
    outputSelection: null
  });
  I.know({
    build: function(stream, input, output) {
      I.$super.build.call(this, stream);
      this.inputSelection = input || I.returnTrue;
      this.outputSelection = output || I.returnTrue;
    }
  });
  I.play({
    read: function() {
      var agent = this.$agent, selection = this.inputSelection;
      return I.$superRole.read.call(this).completes(function(event) {
        var it = event.origin().get();
        return selection(it) ? it : agent.read();
      });
    },
    write: function(it) {
      var selection = this.outputSelection;
      if (selection(it)) {
        return I.$superRole.write.call(this, it);
      }
    }
  });

})