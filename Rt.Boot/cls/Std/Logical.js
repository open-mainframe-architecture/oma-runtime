'Contextual'.subclass(function (I) {
  "use strict";
  // I describe a logical object whose definitions span one or more modules.
  I.have({
    // array with modules that define this logical and all logicals inside it
    logicModules: null,
    // fully qualified name of this logical
    logicName: null
  });
  I.know({
    addModule: function (module) {
      if (this.logicModules.indexOf(module) < 0) {
        this.logicModules.push(module);
        // continue adding the module, possibly until the root namespace has been reached
        this.getContext().addModule(module);
      }
    },
    buildLogical: function (context, key, module) {
      this.buildContextual(context, key);
      this.logicModules = [module];
      // make sure the context includes the module of this new logical 
      context.addModule(module);
    },
    getModule: function () {
      // first module is also known as the defining module (as opposed to a refining module)
      return this.logicModules[0];
    },
    getName: function () {
      if (this.logicName) {
        return this.logicName;
      }
      var home = this.getContext(), key = this.getKey();
      this.logicName = home.isRootContext() ? key : home.getName() + '.' + key;
      return this.logicName;
    },
    getNamespace: function () {
      var context = this.getContext();
      return I._.Logic._.Namespace.describes(context) ? context : context.getNamespace();
    },
    resolve: function (path) {
      // split path string in separated elements
      return I.$super.resolve.call(this, typeof path === 'string' ? path.split('.') : path);
    }
  });
})