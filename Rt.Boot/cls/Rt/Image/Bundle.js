//@ A bundle distributes one or more modules.
'Std.BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{string} bundle name must be unique within a runtime image
    bundleName: null,
    //@{Std.Dictionary} mapping from names to modules that this bundle distributes
    bundledModules: null,
    //@{Std.HTPP.URL} URL where JavaScript bundle loader is located
    bundleURL: null
  });
  I.know({
    //@param name {string} bundle name
    //@param loaderURL {Std.HTTP.URL} URL of bundle loader
    build: function (name, loaderURL) {
      I.$super.build.call(this);
      this.bundleName = name;
      this.bundleURL = loaderURL;
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.bundledModules = I._.Std._.Dictionary.create();
    },
    //@ Add new module to this bundle.
    //@param module {Std.Logic.Module} new module that belong to this bundle
    //@return nothing
    addBundledModule: function (module) {
      var modules = this.bundledModules;
      var name = module.getName();
      // module must be an addition to this bundle
      if (module.getBundle() !== this || modules.containsIndex(name)) {
        this.bad('module', name);
      }
      modules.store(module, name);
    },
    //@ Create loader for new module.
    //@param name {string} module name
    //@param spec {Rt.Table} module specification with classes and configurations
    //@return {Rt.Image.ModuleLoader} loader for new module
    createModuleLoader: function (name, spec_) {
      return I._.ModuleLoader.create(this, name, spec_);
    },
    //@ Get anonymous module that configures info about this bundle.
    //@return {Std.Logic.Module} module
    getAnonymousModule: function() {
      return I.$module.lookup(this.bundleName);
    },
    //@ Get configuration of anonymous module.
    //@return {Std.Logic.Config} module configuration
    getConfig: function () {
      return this.getAnonymousModule().getConfig();
    },
    //@ Get name of this bundle. The name is unique within runtime image.
    //@return {string} bundle name
    getName: function () {
      return this.bundleName;
    },
    //@ Get location of bundle loader.
    //@return {Std.HTTP.URL} URL of loader
    getLocation: function() {
      return this.bundleURL;
    }
  });
})