//@ A module holds nested modules.
'Container'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Std.Runtime.Bundle} bundle that distributes this module
    assetBundle: null,
    //@{Std.Logic.Config} configuration of this module
    logicConfig: null,
    //@{boolean?} true if loaded, false if unloadable, null if still loading
    fullyLoaded: null
  });
  const Root = I._.Root, Config = I._.Config, Namespace = I._.Namespace;
  I.know({
    //@param home {Std.Logic.Namespace|Std.Logic.Module|string} container or name of this module
    //@param key {string?} unique key of this module in its container or nothing if home is name
    //@param bundle {Std.Runtime.Bundle} bundle of this module
    //@param configures {[function]?} configuration closures
    build: function(home, key, bundle, configures) {
      // is home parameter name of the new module?
      if (I.isString(home)) {
        const keys = home.split('.');
        key = keys.pop();
        // if necessary, create ancestor module or namespace of new module
        home = Root.makeContainers(keys, (ancestorHome, ancestorKey) => ancestorHome.isModule() ?
          I.$.create(ancestorHome, ancestorKey, bundle) :
          Namespace.create(ancestorHome, ancestorKey, this)
        );
      }
      // at this point, home must be home container and key must be key of new module
      I.$super.build.call(this, home, key, this);
      this.assetBundle = bundle;
      this.logicConfig = Config.create(configures);
      home.update(key, this);
    },
    isModule: I.returnTrue,
    //@ Mark this module as successfully loaded or permanently unloadable.
    //@param flag {boolean} true for successful load, false for unloadable
    //@return nothing
    beLoaded: function(flag) {
      this.fullyLoaded = !!flag;
      Object.freeze(this);
    },
    //@ Get bundle that distributes this module.
    //@return {Std.Runtime.Bundle} a bundle
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