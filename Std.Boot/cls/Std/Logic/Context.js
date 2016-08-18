//@ A context is the home location of logic objects.
'Logic.Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Set<Std.Logic.Module>} modules that define this context and all logic objects inside it
    logicModules: null
  });
  I.know({
    //@param parentContext {Std.Logic.Context} parent context of this context
    //@param module {Std.Logic.Module} defining module
    build: function(parentContext, key, module) {
      I.$super.build.call(this, parentContext, key);
      this.logicModules = new Set([module]);
      // make sure the parent context includes the module of this context
      parentContext.addModule(module);
    },
    //@ Add module to this context and its ancestor contexts.
    //@param module {Std.Logic.Module} module to add if not present
    //@return nothing
    addModule: function(module) {
      if (!this.logicModules.has(module)) {
        this.logicModules.add(module);
        // continue adding the module, possibly until the root namespace has been reached
        this.getContext().addModule(module);
      }
    },
    //@ Get the defining module of this logic object.
    //@return {Std.Logic.Module} module that defines this logic object
    getModule: function() {
      // first module is defining module, others are refining modules
      return this.logicModules.values().next().value;
    },
    //@ Iterate over modules of this context.
    //@return {iterable} iterable modules
    iterateModules: function() {
      return this.logicModules.values();
    },
    //@ Select logic object from this context.
    //@param key {string} key of logic object to select
    //@return {Std.Logic.Object?} logic object or nothing
    select: I.burdenSubclass
  });
})