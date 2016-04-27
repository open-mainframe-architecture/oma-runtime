'super'.subclass({
  data$: 'Std.Data'
}, (I, We) => {
  "use strict";
  const Agent = I._.Theater._.Agent;
  We.know({
    //@ Create remote agent.
    //@param manager {Std.Theater.Agent?} supervising manager
    //@param stream {Std.Agent} stream for message transport
    //@param alternativeTypespace {Std.Data.Typespace?} nonstandard typespace or nothing
    //@return {Std.Theater.Agent} new agent
    spawnRemote: function(manager, stream, alternativeTypespace) {
      const sceneMethods = this.getSceneMethods();
      const typespace = alternativeTypespace || I.data$;
      const proxy = Agent._.RemoteProxy.create(stream, sceneMethods, typespace);
      return sceneMethods.spawnAgent(manager, proxy);
    }
  });
})