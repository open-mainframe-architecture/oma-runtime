//@ Agent methods delegate to actor roles.
'Logic.SpecialMethods'.subclass(function(I) {
  "use strict";
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
      var parentPrototype = parent ? parent.agentPrototype : I._.Agent.getPrototype();
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
    prepareScript: function(scriptInst, scriptMeta) {
      // add keywords to support scene methods in class scripts
      var parent = this.getParentMethods();
      if (parent) {
        I.defineConstant(scriptInst, '$superRole', parent._);
      }
      scriptInst.play = scriptPlay;
      if (scriptInst.$.getModule() !== scriptInst.$module) {
        I.defineConstant(scriptInst, '$formerRole', I.createTable());
        scriptInst.refineRole = scriptRefine;
      }
    },
    //@ Create agent that implements these agent methods.
    //@param ... {any} constructor arguments
    //@return {Std.Theater.Agent} new agent
    createAgent: function() {
      var Constructor = this.agentConstructor;
      return new Constructor(arguments);
    },
    //@ Spawn new agent/actor/role triple.
    //@param role {Std.Role} actor role of triple
    //@param manager {Std.Theater.Agent?} supervising manager
    //@return {Std.Theater.Agent} theater agent of triple
    spawnAgent: function(role, manager) {
      var actor = I._.Actor.create(role, this, manager), agent = actor.getAgent();
      role.initialize(agent);
      actor.resched();
      return agent;
    }
  });
  I.share({
    SelectorPrefix: 'scene' + I.SelectorPrefix
  });
  function scriptPlay(methods_) { //jshint validthis:true
    var sceneMethods = this.$.getSceneMethods(), agentPrototype = sceneMethods.agentPrototype;
    sceneMethods.addMethods(this.$module, methods_);
    for (var key in methods_) {
      I.defineConstant(agentPrototype, key, I._.Agent._.createScenePerformer(key));
    }
  }
  function scriptRefine(refinedMethods_) { //jshint validthis:true
    this.$.getSceneMethods().refineMethods(this.$module, refinedMethods_, this.$formerRole);
  }
})