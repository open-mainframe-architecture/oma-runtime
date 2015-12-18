'BaseObject+Immutable'.subclass(function (I, We) {
  "use strict";
  // I describe agents that represent actors.
  I.am({
    Final: true
  });
  I.have({
    // this agent is a representative of an actor, with a lot of methods in common
    agentActor: null
  });
  I.know({
    build: function (actor) {
      I.$super.build.call(this);
      this.agentActor = actor;
    },
    getActor: function () {
      return this.agentActor;
    },
    getManagementDepth: function () {
      return this.agentActor.getManagementDepth();
    },
    getManager: function () {
      return this.agentActor.getManager();
    },
    getRoleClass: function () {
      return this.agentActor.getRoleClass();
    },
    isDead: function () {
      return this.agentActor.isDead();
    },
    isInTrouble: function () {
      return this.agentActor.isInTrouble();
    },
    isManager: function () {
      return this.agentActor.isManaging();
    },
    isManagedBy: function (manager) {
      return this.agentActor.isManagedBy(manager);
    },
    walkSubordinates: function () {
      return I.Loop.collect(this.agentActor.walkSubordinates(), getAgent);
    },
    walkTeam: function () {
      return I.Loop.collect(this.agentActor.walkTeam(), getAgent);
    }
  });
  We.know({
    enumerateServices: function (agent, visit) {
      return agent.getRoleClass().enumerateServices(agent, visit);
    }
  });
  I.share({
    // create closure for play method
    createScenePerformer: function (selector) {
      return function () {
        return this.agentActor.createJob(selector, I.slice(arguments));
      };
    },
    // create closure for peek method
    createStatePeeker: function (selector) {
      return function () {
        return this.agentActor.peekState(selector, I.slice(arguments));
      };
    }
  });
  // hoist code to extract agent from actor
  function getAgent(actor) { return actor.getAgent(); }
})