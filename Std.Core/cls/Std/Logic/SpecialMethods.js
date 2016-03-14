//@ A dictionary with special instance method closures that cannot be invoked directly.
'Dictionary'.subclass(function(I) {
  "use strict";
  I.have({
    //@{Std.Logic.Behavior} behavior that has been enhanced with special methods
    enhancedBehavior: null
  });
  I.know({
    //@param parent {Std.Dictionary} base dictionary with parent methods
    //@param behavior {Std.Logic.Behavior} enhanced behavior
    build: function(parent, behavior) {
      I.$super.build.call(this, parent);
      this.enhancedBehavior = behavior;
    },
    //@ Add closures of special methods.
    //@param module {Std.Logic.Module} defining module
    //@param specialMethods_ {Std.Table} mapping from method names to closures
    //@return nothing
    addMethods: function(module, specialMethods_) {
      var methods_ = {};
      var prefix = this.$_.SelectorPrefix;
      for (var key in specialMethods_) {
        var closure = specialMethods_[key];
        if (typeof closure !== 'function') {
          this.bad(key);
        }
        methods_[prefix + key] = closure;
        this.store(closure, key);
      }
      this.enhancedBehavior.addInstanceKnowledge(module, methods_);
    },
    //@ Get enhanced behavior.
    //@return {Std.Logic.Behavior} behavior
    getBehavior: function() {
      return this.enhancedBehavior;
    },
    //@ Get dictionary with parent methods.
    //@return {Std.Dictionary?} dictionary or nothing
    getParentMethods: function() {
      return this.baseDictionary;
    },
    //@ Refine closures of special methods.
    //@param module {Std.Logic.Module} refining module
    //@param refinedSpecials_ {Std.Table} mapping from method names to new closures
    //@param formerSpecials_ {Std.Table} accumulator for former closures
    //@return nothing
    //@except when supplied refinements are invalid
    refineMethods: function(module, refinedSpecials_, formerSpecials_) {
      var refinedMethods_ = {};
      var formerMethods_ = Object.create(this.enhancedBehavior.getParentPrototype());
      var prefix = this.$_.SelectorPrefix;
      var key;
      for (key in refinedSpecials_) {
        var closure = refinedSpecials_[key];
        if (typeof closure !== 'function') {
          this.bad(key);
        }
        refinedMethods_[prefix + key] = closure;
        this.store(closure, key);
      }
      this.enhancedBehavior.refineInstanceMethods(module, refinedMethods_, formerMethods_);
      for (key in refinedSpecials_) {
        formerSpecials_[key] = formerMethods_[prefix + key];
      }
    }
  });
  I.share({
    //@{string} key prefix that is added to instance methods
    SelectorPrefix: '@'
  });
})