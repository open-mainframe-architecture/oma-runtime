//@ An agent is a job factory for the actor it represents.
'BaseObject+Immutable'.subclass((I, We) => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{Std.Theater.Actor} this agent is a representative of an actor
    agentActor: null
  });
  I.know({
    //@param actor {Std.Theater.Actor} actor to represent
    build: function(actor) {
      I.$super.build.call(this);
      this.agentActor = actor;
    },
    //@ Create job to perform scene code on stage.
    //@param code {Std.Closure} scene code to perform on stage for this agent
    //@return {Std.Theater.Job} inert theater job
    createScene: function(code) {
      return this.agentActor.createJob(code);
    },
    //@ Create event that fires when the actor of this agent dies.
    //@return {Std.Event} event fires upon and after death
    death: function() {
      return this.agentActor.death();
    },
    //@ Get actor that this agent represents.
    //@param {Std.Theater.Actor} represented actor
    getActor: function() {
      return this.agentActor;
    },
    //@ Get depth from root manager.
    //@return {integer} number of managers in 
    getManagementDepth: function() {
      return this.agentActor.getManagementDepth();
    },
    //@ Get manager of this agent.
    //@return {Std.Theater.Agent} managing agent
    getManager: function() {
      return this.agentActor.getManager();
    },
    //@ Get class of the role that actor of this agent plays.
    //@return {Std.Role.$} role class
    getRoleClass: function() {
      return this.agentActor.getRoleClass();
    },
    //@ Is this agent representing a dead actor?
    //@return {boolean} true if actor is dead, otherwise false
    isDead: function() {
      return this.agentActor.isDead();
    },
    //@ Is the actor of this agent in trouble?
    //@return {boolean} true if actor is in trouble, otherwise false
    isInTrouble: function() {
      return this.agentActor.isInTrouble();
    },
    //@ Is the actor of this agent supervised by given manager?
    //@param manager {Std.Theater.Agent} managing agent
    //@return {boolean} true if actor is supervised by given manager, otherwise false
    isManagedBy: function(manager) {
      return this.agentActor.isManagedBy(manager);
    },
    //@ Can this agent manage actors?
    //@return {boolean} true if this agent is a manager, otherwise false
    isManager: function() {
      return this.agentActor.isManaging();
    },
    //@ Run code on stage.
    //@param code {Std.Closure} scene code to perform on stage for this agent
    //@return {Std.Theater.Job} running theater job
    runScene: function(code) {
      return this.createScene(code).running();
    },
    //@ Walk over managers of this agent.
    //@return {Std.Iterator} iterator over managing agents
    walkManagers: function() {
      return I.Loop.collect(this.agentActor.walkManagers(), actor => actor.getAgent());
    },
    //@ Walk over agents that are directly managed by this agent.
    //@return {Std.Iterator} iterator over managed agents
    walkTeam: function() {
      return I.Loop.collect(this.agentActor.walkTeam(), actor => actor.getAgent());
    }
  });
  We.know({
    enumerateServices: function(agent, visit) {
      // enumerate over service role classes
      return agent.getRoleClass().enumerateServices(agent, visit);
    }
  });
  I.share({
    //@ Create closure for scene method.
    //@param selector {string} scene name
    //@return {Std.Closure} method closure
    createScenePerformer: function(selector) {
      return function() {
        return this.agentActor.createJob(selector, I.slice(arguments));
      };
    }
  });
})