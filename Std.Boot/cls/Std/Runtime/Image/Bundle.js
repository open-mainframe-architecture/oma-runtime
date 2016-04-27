//@ A bundle distributes one or more modules.
'BaseObject'.subclass(I => {
  "use strict";
  const Dictionary = I._.Dictionary, ModuleLoader = I._.ModuleLoader;
  I.have({
    //@{string} bundle name must be unique within a runtime image
    bundleName: null,
    //@{Std.Dictionary} mapping from names to modules that this bundle distributes
    bundledModules: null
  });
  I.know({
    //@param name {string} bundle name
    build: function(name) {
      I.$super.build.call(this);
      this.bundleName = name;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.bundledModules = Dictionary.create();
    },
    //@ Add new module to this bundle.
    //@param module {Std.Logic.Module} new module that belong to this bundle
    //@return nothing
    addBundledModule: function(module) {
      const modules = this.bundledModules, name = module.getName();
      // module must be a valid addition to this bundle
      this.assert(module.getBundle() === this, !modules.containsIndex(name));
      modules.store(module, name);
    },
    //@ Create loader for new module.
    //@param name {string} module name
    //@param spec {Std.Table} module specification with classes and configurations
    //@return {Std.Runtime.Image.ModuleLoader} loader for new module
    createModuleLoader: function(name, spec_) {
      return ModuleLoader.create(this, name, spec_);
    },
    //@ Get configuration of anonymous module.
    //@return {Std.Logic.Config} module configuration
    getConfig: function() {
      return I.$module.lookup(this.bundleName).getConfig();
    },
    //@ Get name of this bundle. The name is unique within runtime image.
    //@return {string} bundle name
    getName: function() {
      return this.bundleName;
    }
  });
})