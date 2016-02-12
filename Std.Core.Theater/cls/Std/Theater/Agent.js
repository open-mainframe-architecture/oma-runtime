//@ An agent represents an actor with a convenient calling interface to create jobs.
'BaseObject+Immutable'.subclass(function (I, We) {
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
    build: function (actor) {
      I.$super.build.call(this);
      this.agentActor = actor;
    },
    //@ Get actor that this agent represents.
    //@param {Std.Theater.Actor} represented actor
    getActor: function () {
      return this.agentActor;
    },
    //@ Get depth from root manager.
    //@return {integer} number of managers in 
    getManagementDepth: function () {
      return this.agentActor.getManagementDepth();
    },
    //@ Get manager of this agent.
    //@return {Std.Theater.Agent} managing agent
    getManager: function () {
      return this.agentActor.getManager();
    },
    //@ Get class of the role that actor of this agent plays.
    //@return {Std.Role.$} role class
    getRoleClass: function () {
      return this.agentActor.getRoleClass();
    },
    //@ Is this agent representing a dead actor?
    //@return {boolean} true if actor is dead, otherwise false
    isDead: function () {
      return this.agentActor.isDead();
    },
    //@ Is the actor of this agent in trouble?
    //@return {boolean} true if actor is in trouble, otherwise false
    isInTrouble: function () {
      return this.agentActor.isInTrouble();
    },
    //@ Is the actor of this agent supervised by given manager?
    //@param manager {Std.Theater.Agent} managing agent
    //@return {boolean} true if actor is supervised by given manager, otherwise false
    isManagedBy: function (manager) {
      return this.agentActor.isManagedBy(manager);
    },
    //@ Can this agent manage actors?
    //@return {boolean} true if this agent is a manager, otherwise false
    isManager: function () {
      return this.agentActor.isManaging();
    },
    //@ Walk over managers of this agent.
    //@return {Std.Iterator} iterator over managing agents
    walkManagers: function () {
      return I.Loop.collect(this.agentActor.walkManagers(), getAgent);
    },
    //@ Walk over agents that are managed by this agent.
    //@return {Std.Iterator} iterator over managed agents, directly and indirectly
    walkSubordinates: function () {
      return I.Loop.collect(this.agentActor.walkSubordinates(), getAgent);
    },
    //@ Walk over agents that are directly managed by this agent.
    //@return {Std.Iterator} iterator over managed agents
    walkTeam: function () {
      return I.Loop.collect(this.agentActor.walkTeam(), getAgent);
    }
  });
  We.know({
    enumerateServices: function (agent, visit) {
      // enumerate over service role classes
      return agent.getRoleClass().enumerateServices(agent, visit);
    }
  });
  I.share({
    //@ Create closure for play method.
    //@param selector {string} play method selector
    //@return {Rt.Closure} method closure
    createScenePerformer: function (selector) {
      return function () {
        return this.agentActor.createJob(selector, I.slice(arguments));
      };
    },
    //@ Create closure for peek method.
    //@param selector {string} peek method selector
    //@return {Rt.Closure} method closure
    createStatePeeker: function (selector) {
      return function () {
        return this.agentActor.peekState(selector, I.slice(arguments));
      };
    }
  });
  // hoist code to get agent from actor
  function getAgent(actor) { return actor.getAgent(); }
})