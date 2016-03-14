function refine(I, We) {
  "use strict";
  We.know({
    //@ Create proxy to agent on other side of the stream.
    //@param manager {Std.Theater.Agent} manager of new proxy
    //@param stream {Std.Theater.Agent} stream with command messages
    //@return {Std.Theater.Agent} proxy to agent
    commandWith: function(manager, stream) {
      var role = I._.Theater._.Agent._.Proxy.create(stream);
      return this.getSceneMethods().spawnAgent(role, manager);
    }
  });
}