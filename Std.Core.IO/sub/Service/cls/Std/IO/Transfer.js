//@ A transfer service moves items between streams.
'BaseObject+Role'.subclass(['Std.Core.Theater'], function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    //@ Copy items from input to output stream.
    //@param input {Std.Stream} input stream
    //@param output {Std.Stream} output stream
    //@promise nothing when input has been exhausted
    copy: function(input, output) {
      if (!input.isDead()) {
        return input.read().yields(function(it) {
          return output.write(it).triggers(this.$agent.copy(input, output));
        });
      }
    }
  });
})