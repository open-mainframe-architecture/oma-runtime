//@ Agent methods delegate to actor roles.
'Logic.SpecialMethods'.subclass(function (I) {
  "use strict";
  I.have({
    //@{Std.Theater.Agent} prototype invokes synchronous peek methods and asynchronous play methods
    agentPrototype: null,
    //@{Rt.Closure} constructor of new agents
    agentConstructor: null
  });
  I.know({
    //@param parent {Std.Theater.AgentMethods?} optional base dictionary with inherited methods
    //@param behavior {Std.Role.$} role class is owner of agent methods
    build: function (parent, behavior) {
      I.$super.build.call(this, parent, behavior);
      var parentPrototype = parent ? parent.agentPrototype : I._.Agent.getPrototype();
      this.agentPrototype = Object.create(parentPrototype);
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.agentConstructor = function Agent(constructionArguments) {
        I.prepareNew(this);
        I.initializeNew(this, constructionArguments);
      };
      this.agentConstructor.prototype = this.agentPrototype;
    },
    prepareScript: function (scriptInst, scriptMeta) {
      // add keywords to support peek and play methods in class scripts
      var parent = this.getParentMethods();
      if (parent) {
        I.defineConstant(scriptInst, '$superRole', parent._);
      }
      scriptInst.peek = scriptPeek;
      scriptInst.play = scriptPlay;
      if (scriptInst.$.getModule() !== scriptInst.$module) {
        I.defineConstant(scriptInst, '$formerRole', I.createTable());
        scriptInst.refineRole = scriptRefine;
      }
    },
    //@ Create agent that implements these agent methods.
    //@param ... {any} constructor arguments
    //@return {Std.Theater.Agent} new agent
    createAgent: function () {
      var Constructor = this.agentConstructor;
      return new Constructor(arguments);
    }
  });
  I.share({
    SelectorPrefix: 'role' + I.SelectorPrefix
  });
  function scriptPeek(methods_) { //jshint validthis:true
    var agentMethods = this.$.getAgentMethods();
    agentMethods.addMethods(this.$module, methods_);
    for (var key in methods_) {
      I.defineConstant(agentMethods.agentPrototype, key, I._.Agent._.createStatePeeker(key));
    }
  }
  function scriptPlay(methods_) { //jshint validthis:true
    var agentMethods = this.$.getAgentMethods();
    agentMethods.addMethods(this.$module, methods_);
    for (var key in methods_) {
      I.defineConstant(agentMethods.agentPrototype, key, I._.Agent._.createScenePerformer(key));
    }
  }
  function scriptRefine(refinedMethods_) { //jshint validthis:true
    this.$.getAgentMethods().refineMethods(this.$module, refinedMethods_, this.$formerRole);
  }
})