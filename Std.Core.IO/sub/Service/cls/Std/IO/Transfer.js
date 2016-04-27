//@ A transfer service moves items between streams.
'BaseObject+Role'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    //@ Move items from input to output stream.
    //@param input {Std.Stream} input stream
    //@param output {Std.Stream} output stream
    //@promise nothing when input has been exhausted
    move: function(input, output) {
      if (!input.isDead()) {
        return input.read()
          .propels(it => output.write(it))
          .propels(this.$agent.copy(input, output));
      }
    }
  });
})