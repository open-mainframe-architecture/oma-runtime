//@ A dictionary with special instance methods that cannot be invoked directly.
'Dictionary'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Logic.Behavior} behavior that has been enhanced with special methods
    enhancedBehavior: null,
    //@{Std.Table} table with method specialties
    methodSpecialties_: null
  });
  I.know({
    //@param parent {Std.Dictionary} base dictionary with special methods of parent behavior
    //@param behavior {Std.Logic.Behavior} enhanced behavior
    build: function(parent, behavior) {
      I.$super.build.call(this, parent);
      this.enhancedBehavior = behavior;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      const base = this.baseDictionary;
      // inherit specialties from parent methods
      this.methodSpecialties_ = base ? Object.create(base.methodSpecialties_) : I.createTable();
    },
    //@ Add special methods to this dictionary.
    //@param module {Std.Logic.Module} defining module
    //@param methodSpecifications_ {Std.Table} map names to method specifications
    //@return nothing
    addMethods: function(module, methodSpecifications_) {
      const methodSpecialties_ = this.methodSpecialties_, prefix = this.$_.SelectorPrefix;
      const methods_ = {};
      for (let key in methodSpecifications_) {
        const specification = methodSpecifications_[key], inherited = methodSpecialties_[key];
        this.assert(specification, !I.isPropertyOwner(methodSpecialties_, key));
        const specialties = inherited ? Object.create(inherited) : I.createTable();
        for (let specialty in specification) {
          if (specialty !== 'method') {
            // subclass can add new specialty, but it cannot redefine inherited specialty
            this.assert(!specialties[specialty]);
            specialties[specialty] = specification[specialty];
          }
        }
        const closure = specification.method || specification;
        this.assert(I.isClosure(closure));
        methods_[prefix + key] = closure;
        methodSpecialties_[key] = specialties;
        this.store(closure, key);
      }
      this.enhancedBehavior.addInstanceKnowledge(module, methods_);
    },
    //@ Find specialties of special method.
    //@param selector {string} method name
    //@return {Std.Table?} nothing or table with specialties
    findSpecialties: function(selector) {
      return this.methodSpecialties_[selector];
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
    //@param refinedClosures_ {Std.Table} mapping from method names to new closures
    //@param formerSpecials_ {Std.Table} accumulator for former closures
    //@return nothing
    //@except when supplied refinements are invalid
    refineMethods: function(module, refinedClosures_, formerSpecials_) {
      const refinedMethods_ = {}, prefix = this.$_.SelectorPrefix;
      const formerMethods_ = Object.create(this.enhancedBehavior.getParentPrototype());
      for (let key in refinedClosures_) {
        const closure = refinedClosures_[key];
        this.assert(I.isClosure(closure));
        refinedMethods_[prefix + key] = closure;
        this.store(closure, key);
      }
      this.enhancedBehavior.refineInstanceMethods(module, refinedMethods_, formerMethods_);
      for (let key in refinedClosures_) {
        formerSpecials_[key] = formerMethods_[prefix + key];
      }
    }
  });
  I.share({
    //@{string} key prefix that is added to instance methods
    SelectorPrefix: '@'
  });
})