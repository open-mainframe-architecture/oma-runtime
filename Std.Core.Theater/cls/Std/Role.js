'Trait'.subclass(function (I, We) {
  "use strict";
  // I describe a role that performs asynchronous scenes with actors/agents.
  I.have({
    // theater job when this role is busy performing a scene on stage 
    theaterJob: null
  });
  I.access({
    // agent representation when this role is busy
    $agent: function () {
      return this.theaterJob.getAgent();
    }
  });
  I.know({
    // initialize new agent/actor/role triple
    initialize: I.doNothing,
    // nonintrusive peek into state
    peekState: function (selector, parameters) {
      return this.$.agentMethods._[selector].apply(this, parameters);
    },
    // play next scene on stage
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
    agentMethods: null
  });
  We.know({
    prepareScript: function (scriptInst, scriptMeta) {
      We.$super.prepareScript.call(this, scriptInst, scriptMeta);
      // add keywords to define and refine agent methods
      this.getAgentMethods().prepareScript(scriptInst, scriptMeta);
    },
    getAgentMethods: function () {
      if (this.agentMethods) {
        return this.agentMethods;
      }
      var parentBehavior = this.getParentBehavior();
      var parentMethods = parentBehavior.getAgentMethods && parentBehavior.getAgentMethods();
      this.agentMethods = I._.Theater._.AgentMethods.create(parentMethods, this);
      return this.agentMethods;
    },
    // create new agent/actor/role triple that is supervised by a manager
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