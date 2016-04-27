//@ A module contains definitions and refinements of logicals.
'LogicalContainer'.subclass(I => {
  "use strict";
  const Config = I._.Config, Namespace = I._.Namespace, Root = I._.Root;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Runtime.Image.Bundle} bundle that distributes this module
    assetBundle: null,
    //@{Std.Logic.Config} immutable configuration of this module
    logicConfig: null,
    //@{boolean?} true if loaded, false if unloadable, null if still loading
    fullyLoaded: null
  });
  I.know({
    //@param home {Std.Logic.Namespace|Std.Logic.Module|string} context or name of this module
    //@param key {string?} unique key of this module in its context or nothing if home is name
    //@param bundle {Std.Runtime.Image.Bundle} bundle of this module
    //@param configures {[Std.Closure]?} configuration closures
    build: function(home, key, bundle, configures) {
      // is home parameter logical name of the new module?
      if (typeof home === 'string') {
        const keys = home.split('.');
        key = keys.pop();
        // if necessary, create ancestor module or namespace of new module
        home = Root.makeContexts(keys, (ancestorHome, ancestorKey) => I.$.describes(ancestorHome) ?
          I.$.create(ancestorHome, ancestorKey, bundle) :
          Namespace.create(ancestorHome, ancestorKey, this)
        );
      }
      // at this point, home must be home context and key must be context key of new module
      I.$super.build.call(this, null, home, key, this);
      this.assetBundle = bundle;
      this.logicConfig = Config.create(configures);
      home.store(this, key);
    },
    unveil: function() {
      I.$super.unveil.call(this);
      this.assetBundle.addBundledModule(this);
    },
    checkStorage: function(module, ix) {
      // a module is a context for child modules
      return I.$super.checkStorage.call(this, module, ix) && I.$.describes(module);
    },
    //@ Mark this module as successfully loaded or permanently unloadable.
    //@param flag {boolean} true for successful load, false for unloadable
    //@return nothing
    //@except when module is not loading
    beLoaded: function(flag) {
      this.assert(this.fullyLoaded === null);
      this.fullyLoaded = !!flag;
    },
    //@ Get bundle that distributes this module.
    //@return {Std.Runtime.Image.Bundle} bundle
    getBundle: function() {
      return this.assetBundle;
    },
    //@ Get module configuration.
    //@return {Std.Logic.Config} configuration
    getConfig: function() {
      return this.logicConfig;
    },
    //@ Test whether this module has been successfully loaded.
    //@return {boolean} true if module has been loaded, otherwise false
    isLoaded: function() {
      return this.fullyLoaded === true;
    },
    //@ Test whether this module is still loading.
    //@return {boolean} true if module is loading, otherwise false
    isLoading: function() {
      return this.fullyLoaded === null;
    },
    //@ Test whether this module cannot be loaded.
    //@return {boolean} true if module cannot be loaded, otherwise false
    isUnloadable: function() {
      return this.fullyLoaded === false;
    }
  });
})