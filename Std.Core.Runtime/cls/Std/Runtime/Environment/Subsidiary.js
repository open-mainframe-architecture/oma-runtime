//@ A subsidiary controls a child runtime environment.
'BaseObject+Manager'.subclass({
  data$: 'Std.Data'
}, function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Theater.Agent} crossover stream to child environment
    childStream: null,
    //@{Std.Data.Value.Record} record value of Runtime.Image type
    imageValue: null,
    //@{Std.Theater.Agent} agent proxy of child environment
    childEnvironment: null
  });
  I.know({
    //@param stream {Std.Theater.Agent} stream to child environment
    //@param image {Std.Data.Value.Record} image value for environment
    build: function(stream, image) {
      I.$super.build.call(this);
      this.childStream = stream;
      this.imageValue = image;
    },
    initialize: function(agent) {
      I.$super.initialize.call(this, agent);
      var child = this.childEnvironment = I._.Service.spawnProxy(agent, this.childStream);
      child.installImage(I.data$.marshal(this.imageValue, 'Runtime.Image')).run();
    },
    assessDamage: I._.Management._.Damage._.returnMinimal
  });
  I.play({
    runModule: function(moduleName, argv) {
      return this.childEnvironment.runModule(moduleName, argv);
    }
  });
})