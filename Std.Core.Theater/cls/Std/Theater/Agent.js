//@ An immutable agent is a job factory for the actor it represents.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Theater.Actor} this agent is a representative of an actor
    agentActor: null
  });
  I.access({
    //@{Std.Theater.Actor} get actor that this agent represents
    $actor: function() {
      return this.agentActor;
    }
  });
  I.know({
    //@param actor {Std.Theater.Actor} actor to represent
    build: function(actor) {
      I.$super.build.call(this);
      this.agentActor = actor;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      Object.freeze(this);
    },
    //@ Create job to perform scene closure on stage.
    //@param closure {function} scene closure to perform on stage with this agent
    //@param parameters {[*]} scene parameters
    //@return {Std.Theater.Job} inert theater job
    createScene: function(closure, parameters) {
      return this.agentActor.createJob(closure, parameters);
    },
    //@ Run closure on stage.
    //@param closure {function} scene closure to perform on stage with this agent
    //@param parameters {[*]} scene parameters
    //@return {Std.Theater.Job} running theater job
    runScene: function(closure, parameters) {
      return this.createScene(closure, parameters).running();
    }
  });
  I.share({
    //@ Create closure for scene method.
    //@param selector {string} scene name
    //@return {function} method closure
    createScenePerformer: selector => function() {
      return this.agentActor.createJob(selector, [...arguments]);
    }
  });
})