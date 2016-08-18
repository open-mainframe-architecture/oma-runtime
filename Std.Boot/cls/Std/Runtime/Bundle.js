//@ A bundle distributes one or more modules.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Final: true
  });
  I.have({
    //@{string} bundle name must be unique within a runtime image
    bundleName: null
  });
  const Module = I._.Logic._.Module, ModuleLoader = I._.Image._.ModuleLoader;
  I.know({
    //@param name {string} bundle name
    build: function(name) {
      I.$super.build.call(this);
      this.bundleName = name;
    },
    //@ Create loader for new module.
    //@param name {string} module name
    //@param spec {object|Std.Table} module specification with classes and configurations
    //@return {Std.Runtime.Image.ModuleLoader} loader for new module
    createModuleLoader: function(name, spec) {
      const configures = spec[''];
      // create regular module with unique name
      const module = name ? Module.create(name, null, this, configures) :
        // create anonymous module (child of boot module) whose name is derived from bundle name
        Module.create(I.$module, this.bundleName, this, configures);
      return ModuleLoader.create(module, spec);
    },
    //@ Get configuration of anonymous module.
    //@return {Std.Logic.Config} module configuration
    getConfig: function() {
      return I.$module.select(this.bundleName).getConfig();
    },
    //@ Get name of this bundle. The name is unique within runtime image.
    //@return {string} bundle name
    getName: function() {
      return this.bundleName;
    }
  });
})