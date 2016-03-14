//@ The definition of a logical object spans one or more modules.
'Contextual'.subclass(function(I) {
  "use strict";
  I.have({
    //@{[Std.Logic.Module]} modules that define this logical and all logicals inside it
    logicModules: null,
    //@{string} fully qualified name of this logical
    logicName: null
  });
  I.know({
    //@param path {string|[string]} dot-separated path to resolved logical or path array
    resolve: function(path) {
      // split path string in separated elements
      return I.$super.resolve.call(this, typeof path === 'string' ? path.split('.') : path);
    },
    //@ Add module to this logical and its ancestor contexts, unless module is already present.
    //@param module {Std.Logic.Module} module to add if not present
    //@return nothing
    addModule: function(module) {
      if (this.logicModules.indexOf(module) < 0) {
        this.logicModules.push(module);
        // continue adding the module, possibly until the root namespace has been reached
        this.getContext().addModule(module);
      }
    },
    //@ Build a new logical object.
    //@param context {Std.Context} home context of new logical
    //@param key {string} unique key of new logical within context
    //@param module {Std.Logic.Module} defining module of new logical
    //@return nothing
    buildLogical: function(context, key, module) {
      this.buildContextual(context, key);
      this.logicModules = [module];
      // make sure the context includes the module of this new logical 
      context.addModule(module);
    },
    //@ Get the defining module of this logical.
    //@return {Std.Logic.Module} module that defines this logical
    getModule: function() {
      // first module is defining module, others are refining modules
      return this.logicModules[0];
    },
    //@ Get unique name of this logical.
    //@return {string} dot-separated path from root namespace to this logical
    getName: function() {
      if (this.logicName) {
        return this.logicName;
      }
      var home = this.getContext(), key = this.getKey();
      this.logicName = home.isRootContext() ? key : home.getName() + '.' + key;
      return this.logicName;
    },
    //@ Get the namespace in which this logical is contained, either directly or indirectly.
    //@return {Std.Logic.Namespace} most specific namespace that contains this logical
    getNamespace: function() {
      var context = this.getContext();
      while (!I._.Logic._.Namespace.describes(context)) {
        context = context.getContext();
      }
      return context;
    }
  });
})