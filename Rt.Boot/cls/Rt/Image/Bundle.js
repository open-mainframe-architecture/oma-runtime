'Std.BaseObject'.subclass(function(I) {
  "use strict";
  // I am a bundle that distributes one or more modules.
  I.have({
    // bundle id must be unique within a runtime image
    bundleId: null,
    // dictionary with modules that this bundle distributes
    bundledModules: null,
    // path to home directory of bundle
    bundleHome: null
  });
  I.know({
    build: function(id, home) {
      I.$super.build.call(this);
      this.bundleId = id;
      this.bundleHome = home;
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.bundledModules = I._.Std._.Dictionary.create();
    },
    addModule: function(module) {
      var modules = this.bundledModules;
      var name = module.getName();
      // module must be an addition to this bundle
      if (module.getBundle() !== this || modules.containsIndex(name)) {
        this.bad('module', name);
      }
      modules.store(module, name);
    },
    createModuleLoader: function(name, spec_) {
      return I._.ModuleLoader.create(this, name, spec_);
    },
    getId: function() {
      return this.bundleId;
    }
  });
})