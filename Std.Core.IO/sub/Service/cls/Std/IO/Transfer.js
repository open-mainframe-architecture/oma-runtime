'BaseObject+Role'.subclass(['Std.Core.Theater'], function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    copy: function (input, output) {
      if (!input.isDead()) {
        var agent = this.$agent;
        return input.read().completion().triggers(function (ignition) {
          var it = ignition.origin().get();
          return output.write(it).completion().triggers(agent.copy(input, output));
        });
      }
    }
  });
})