'Std.BaseObject'.subclass(function (I) {
  "use strict";
  // I describe a bundle that distributes one or more modules.
  I.have({
    // bundle name must be unique within a runtime image
    bundleName: null,
    // dictionary with modules that this bundle distributes
    bundledModules: null,
    // URL of JavaScript bundle loader
    bundleURL: null
  });
  I.know({
    build: function (name, loaderURL) {
      I.$super.build.call(this);
      this.bundleName = name;
      this.bundleURL = loaderURL;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.bundledModules = I._.Std._.Dictionary.create();
    },
    addModule: function (module) {
      var modules = this.bundledModules;
      var name = module.getName();
      // module must be an addition to this bundle
      if (module.getBundle() !== this || modules.containsIndex(name)) {
        this.bad('module', name);
      }
      modules.store(module, name);
    },
    createModuleLoader: function (name, spec_) {
      return I._.ModuleLoader.create(this, name, spec_);
    },
    getAnonymousModule: function() {
      return I.$module.lookup(this.bundleName);
    },
    getConfig: function () {
      return this.getAnonymousModule().getConfig();
    },
    getName: function () {
      return this.bundleName;
    },
    getLocation: function() {
      return this.bundleURL;
    }
  });
})