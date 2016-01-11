'LogicalContainer'.subclass(function (I) {
  "use strict";
  // I describe a module that contains definitions and refinements of logicals.
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    // bundle that distributes this module
    assetBundle: null,
    // immutable configuration of this module
    logicConfig: null,
    // true if loaded, false if unloadable, null if still loading
    fullyLoaded: null
  });
  I.know({
    build: function (home, key, bundle, configure) {
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
      this.logicConfig = I._.Config.create(configure);
      home.store(this, key);
    },
    unveil: function () {
      I.$super.unveil.call(this);
      this.assetBundle.addModule(this);
    },
    checkStorage: function (module, ix) {
      return I.$super.checkStorage.call(this, module, ix) && I.$.describes(module);
    },
    beLoaded: function (flag) {
      if (this.fullyLoaded !== null) {
        this.bad();
      }
      this.fullyLoaded = !!flag;
    },
    getBundle: function () {
      return this.assetBundle;
    },
    getConfig: function () {
      return this.logicConfig;
    },
    isLoaded: function () {
      return this.fullyLoaded === true;
    },
    isLoading: function () {
      return this.fullyLoaded === null;
    },
    isUnloadable: function () {
      return this.fullyLoaded === false;
    }
  });
})