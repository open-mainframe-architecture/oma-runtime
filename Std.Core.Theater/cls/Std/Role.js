//@ A role performs asynchronous scenes with actors/agents.
'Trait'.subclass(function (I, We) {
  "use strict";
  I.have({
    //@{Std.Theater.Job?} theater job when this role is busy performing a scene on stage
    theaterJob: null
  });
  I.access({
    //@{Std.Theater.Agent} get agent representation of busy role
    $agent: function () {
      return this.theaterJob.getAgent();
    }
  });
  I.know({
    //@ Initialize new agent/actor/role triple.
    //@param agent {Std.Theater.Agent} new agent
    //@return nothing
    initialize: I.doNothing,
    //@ Perform nonintrusive peek into state.
    //@param selector {string} peek name
    //@param parameters {[any]} peek parameters
    //@return {any} result of peek
    peekState: function (selector, parameters) {
      return this.$.agentMethods._[selector].apply(this, parameters);
    },
    //@ Play next scene on stage.
    //@param job {Std.Theater.Job} job of scene to play
    //@param selector {string} scene name
    //@param parameters {[any]} scene parameters
    //@return {any} scene result
    playScene: function (job, selector, parameters) {
      if (this.theaterJob) {
        this.bad();
      }
      this.theaterJob = job;
      try {
        return this.$.agentMethods._[selector].apply(this, parameters);
      } finally {
        this.theaterJob = null;
      }
    }
  });
  We.have({
    //@{Std.Theater.AgentMethods} special agent methods to peek and play
    agentMethods: null
  });
  We.know({
    prepareScript: function (scriptInst, scriptMeta) {
      We.$super.prepareScript.call(this, scriptInst, scriptMeta);
      // add keywords to define and refine agent methods
      this.getAgentMethods().prepareScript(scriptInst, scriptMeta);
    },
    //@ Get agent methods of this role class.
    //@return {Std.Theater.AgentMethods} agent methods
    getAgentMethods: function () {
      if (this.agentMethods) {
        return this.agentMethods;
      }
      var parentBehavior = this.getParentBehavior();
      var parentMethods = parentBehavior.getAgentMethods && parentBehavior.getAgentMethods();
      this.agentMethods = I._.Theater._.AgentMethods.create(parentMethods, this);
      return this.agentMethods;
    },
    //@ Create new agent/actor/role triple that is supervised by a manager.
    //@param manager {Std.Theater.Agent?} supervising manager
    //@param ... {any} construction arguments for new role
    //@return {Std.Theater.Agent} agent of new triple
    spawn: function (manager) {
      var role = this.create.apply(this, I.slice(arguments, 1));
      var actor = I._.Theater._.Actor.create(role, manager);
      var agent = actor.getAgent();
      role.initialize(agent);
      actor.resched();
      return agent;
    }
  });
})