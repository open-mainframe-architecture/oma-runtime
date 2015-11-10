'BaseObject+Role'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    pipe: function(input, output) {
      if (!input.isDead()) {
        var agent = this.$agent;
        return input.read().completes(function(event) {
          return output.write(event.origin().get()).completes(agent.pipe(input, output));
        });
      }
    }
  });
})