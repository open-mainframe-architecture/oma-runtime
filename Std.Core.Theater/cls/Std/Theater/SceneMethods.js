//@ Scene methods of agents delegate to actor roles.
'Logic.SpecialMethods'.subclass(I => {
  "use strict";
  const Agent = I._.Agent, Actor = I._.Actor;
  I.have({
    //@{Std.Theater.Agent} prototype invokes asynchronous scene methods
    agentPrototype: null,
    //@{Std.Closure} constructor of new agents
    agentConstructor: null
  });
  I.know({
    //@param parent {Std.Theater.SceneMethods?} optional base dictionary with inherited methods
    //@param behavior {Std.Role.$} role class is owner of agent methods
    build: function(parent, behavior) {
      I.$super.build.call(this, parent, behavior);
      const parentPrototype = parent ? parent.agentPrototype : Agent.getPrototype();
      this.agentPrototype = Object.create(parentPrototype);
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.agentConstructor = function Agent(constructionArguments) {
        I.prepareNew(this);
        I.initializeNew(this, constructionArguments);
      };
      this.agentConstructor.prototype = this.agentPrototype;
    },
    //@ Create agent that implements these agent methods.
    //@param ... {any} constructor arguments
    //@return {Std.Theater.Agent} new agent
    createAgent: function() {
      const Constructor = this.agentConstructor;
      return new Constructor(arguments);
    },
    //@ Prepare script for scene methods.
    //@param scriptInst {Std.Table} instance side of role class script
    //@param scriptMeta {Std.Table} class side of role class script
    //@return nothing
    prepareScript: function(scriptInst, scriptMeta) {
      // add keywords for scene methods
      const parent = this.getParentMethods();
      if (parent) {
        I.defineConstant(scriptInst, '$superRole', parent._);
      }
      scriptInst.play = scriptPlay;
      if (scriptInst.$.getModule() !== scriptInst.$module) {
        I.defineConstant(scriptInst, '$formerRole', I.createTable());
        scriptInst.refineRole = scriptRefine;
      }
    },
    //@ Spawn new agent/actor/role triple.
    //@param manager {Std.Theater.Agent?} supervising manager
    //@param role {Std.Role} actor role of triple
    //@return {Std.Theater.Agent} theater agent of triple
    spawnAgent: function(manager, role) {
      const actor = Actor.create(role, this, manager), agent = actor.getAgent();
      // claim initialized role for actor/agent
      role.initialize(agent);
      // schedule first performance of actor if it's ready to go on stage
      actor.resched();
      return agent;
    }
  });
  I.share({
    SelectorPrefix: `scene${I.SelectorPrefix}`
  });
  function scriptPlay(methods_) { //jshint validthis:true
    const sceneMethods = this.$.getSceneMethods(), agentPrototype = sceneMethods.agentPrototype;
    sceneMethods.addMethods(this.$module, methods_);
    for (let key in methods_) {
      I.defineConstant(agentPrototype, key, Agent._.createScenePerformer(key));
    }
  }
  function scriptRefine(refinedMethods_) { //jshint validthis:true
    this.$.getSceneMethods().refineMethods(this.$module, refinedMethods_, this.$formerRole);
  }
})