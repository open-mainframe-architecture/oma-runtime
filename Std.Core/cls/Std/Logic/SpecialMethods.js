'Dictionary'.subclass(function(I) {
  "use strict";
  // I describe dictionaries with instance method closures that cannot be invoked directly.
  I.have({
    // behavior that has been enhanced with special methods
    enhancedBehavior: null
  });
  I.know({
    build: function(parent, behavior) {
      I.$super.build.call(this, parent);
      this.enhancedBehavior = behavior;
    },
    // add closures of special methods
    addMethods: function(module, specialMethods_) {
      var methods_ = {};
      var prefix = this.$_.SelectorPrefix;
      for (var key in specialMethods_) {
        var closure = specialMethods_[key];
        if (typeof closure !== 'function') {
          this.bad('method', key);
        }
        methods_[prefix + key] = closure;
        this.store(closure, key);
      }
      this.enhancedBehavior.addInstanceKnowledge(module, methods_);
    },
    getBehavior: function() {
      return this.enhancedBehavior;
    },
    getParentMethods: function() {
      return this.baseDictionary;
    },
    // refine closures of special methods
    refineMethods: function(module, refinedSpecials_, formerSpecials_) {
      var refinedMethods_ = {};
      var formerMethods_ = Object.create(this.enhancedBehavior.getParentPrototype());
      var prefix = this.$_.SelectorPrefix;
      var key;
      for (key in refinedSpecials_) {
        var closure = refinedSpecials_[key];
        if (typeof closure !== 'function') {
          this.bad('method', key);
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
    // key prefix that is added to instance methods
    SelectorPrefix: '@'
  });
})