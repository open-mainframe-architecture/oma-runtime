//@ A role performs asynchronous scenes with actors/agents.
'Trait'.subclass(function(I, We) {
  "use strict";
  I.have({
    //@{Std.Theater.Job?} theater job when this role is busy performing a scene on stage
    theaterJob: null
  });
  I.access({
    //@{Std.Theater.Agent} get agent representation of busy role
    $agent: function() {
      return this.theaterJob.getAgent();
    }
  });
  I.know({
    //@ Perform unknown scene when selector does not designate a scene method.
    //@param selector {string} scene name
    //@param parameters {[any]?} scene parameters
    //@return result of unknown scene
    improvise: I.shouldNotOccur,
    //@ Initialize new agent/actor/role triple.
    //@param agent {Std.Theater.Agent} new agent
    //@return nothing
    initialize: I.doNothing,
    //@ Play next scene on stage.
    //@param job {Std.Theater.Job} job of scene to play
    //@param selector {string|Std.Closure} scene name or scene closure
    //@param parameters {[any]?} scene parameters
    //@return {any} scene result
    playScene: function(job, selector, parameters) {
      if (this.theaterJob) {
        this.bad();
      }
      this.theaterJob = job;
      var method = typeof selector === 'function' ? selector : this.$.sceneMethods._[selector];
      try {
        return method ? method.apply(this, parameters) : this.improvise(selector, parameters);
      } finally {
        this.theaterJob = null;
      }
    }
  });
  We.have({
    //@{Std.Theater.SceneMethods} special methods to play scenes on stage
    sceneMethods: null
  });
  We.know({
    prepareScript: function(scriptInst, scriptMeta) {
      We.$super.prepareScript.call(this, scriptInst, scriptMeta);
      // add keywords to define and refine scene methods
      this.getSceneMethods().prepareScript(scriptInst, scriptMeta);
    },
    //@ Get scene methods of this role class.
    //@return {Std.Theater.SceneMethods} scene methods
    getSceneMethods: function() {
      if (this.sceneMethods) {
        return this.sceneMethods;
      }
      var parentBehavior = this.getParentBehavior();
      var parentMethods = parentBehavior.getSceneMethods && parentBehavior.getSceneMethods();
      this.sceneMethods = I._.Theater._.SceneMethods.create(parentMethods, this);
      return this.sceneMethods;
    },
    //@ Create new agent/actor/role triple that is supervised by a manager.
    //@param manager {Std.Theater.Agent?} supervising manager
    //@param ... {any} construction arguments for new role
    //@return {Std.Theater.Agent} agent of new triple
    spawn: function(manager) {
      var role = this.create.apply(this, I.slice(arguments, 1));
      return this.getSceneMethods().spawnAgent(role, manager);
    }
  });
})