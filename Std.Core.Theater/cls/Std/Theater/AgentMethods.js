'Logic.SpecialMethods'.subclass(function(I) {
  // I describe agent methods that delegate to actor roles.
  "use strict";
  I.have({
    // prototype for agents that invoke synchronous peek methods and asynchronous play methods
    agentPrototype: null,
    // constructor of new agents
    agentConstructor: null
  });
  I.know({
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
    createAgent: function() {
      return new this.agentConstructor(arguments);
    },
    // add keywords to support peek and play methods in class scripts
    prepareScript: function(scriptInst, scriptMeta) {
      var parent = this.getParentMethods();
      I.defineConstant(scriptInst, '$role', this._);
      if (parent) {
        I.defineConstant(scriptInst, '$superRole', parent._);
      }
      scriptInst.peek = scriptPeek;
      scriptInst.play = scriptPlay;
      if (scriptInst.$.getModule() !== scriptInst.$module) {
        I.defineConstant(scriptInst, '$formerRole', I.createTable());
        scriptInst.refineRole = scriptRefine;
      }
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