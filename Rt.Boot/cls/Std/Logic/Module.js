//@ A module contains definitions and refinements of logicals.
'LogicalContainer'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Rt.Image.Bundle} bundle that distributes this module
    assetBundle: null,
    //@{Std.Logic.Config} immutable configuration of this module
    logicConfig: null,
    //@{boolean?} true if loaded, false if unloadable, null if still loading
    fullyLoaded: null
  });
  I.know({
    //@param home {Std.Logic.Namespace|Std.Logic.Module|string} context or name of this module
    //@param key {string?} unique key of this module in its context or nothing if home is name
    //@param bundle {Rt.Image.Bundle} bundle of this module
    //@param configures {[Rt.Closure]?} configuration closures
    build: function (home, key, bundle, configures) {
      // is home parameter logical name of the new module?
      if (typeof home === 'string') {
        var self = this;
        var keys = home.split('.');
        key = keys.pop();
        // if necessary, create ancestor module or namespace of new module
        home = I._.Root.makeContexts(keys, function (ancestorHome, ancestorKey) {
          if (I.$.describes(ancestorHome)) {
            return I.$.create(ancestorHome, ancestorKey, bundle);
          }
          return I._.Namespace.create(ancestorHome, ancestorKey, self);
        });
      }
      // at this point, home must be home context and key must be context key of new module
      I.$super.build.call(this, null, home, key, this);
      this.assetBundle = bundle;
      this.logicConfig = I._.Config.create(configures);
      home.store(this, key);
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.assetBundle.addBundledModule(this);
    },
    checkStorage: function (module, ix) {
      // a module is a context for child modules
      return I.$super.checkStorage.call(this, module, ix) && I.$.describes(module);
    },
    //@ Mark this module as successfully loaded or permanently unloadable.
    //@param flag {boolean} true for successful load, false for unloadable
    //@return nothing
    //@except when module is not loading
    beLoaded: function (flag) {
      if (this.fullyLoaded !== null) {
        this.bad();
      }
      this.fullyLoaded = !!flag;
    },
    //@ Get bundle that distribute this module.
    //@return {Rt.Image.Bundle} bundle
    getBundle: function () {
      return this.assetBundle;
    },
    //@ Get module configuration.
    //@return {Std.Logic.Config} configuration
    getConfig: function () {
      return this.logicConfig;
    },
    //@ Test whether this module has been successfully loaded.
    //@return {boolean} true if module has been loaded, otherwise false
    isLoaded: function () {
      return this.fullyLoaded === true;
    },
    //@ Test whether this module is still loading.
    //@return {boolean} true if module is loading, otherwise false
    isLoading: function () {
      return this.fullyLoaded === null;
    },
    //@ Test whether this module cannot be loaded.
    //@return {boolean} true if module cannot be loaded, otherwise false
    isUnloadable: function () {
      return this.fullyLoaded === false;
    }
  });
})