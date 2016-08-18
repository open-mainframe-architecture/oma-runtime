//@ An immutable module configuration.
'Std.Object'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Table} immutable table with configured things
    _: null
  });
  I.access({
    //@{[string]} get names of modules that must be loaded
    depends: function() {
      return this._.depends || [];
    },
    //@{Std.Table} get factory code of service providers in module
    provides: function() {
      return this._.provides || I.createTable();
    },
    //@{Std.Table} get names of services that must be provided
    requires: function() {
      return this._.requires || I.createTable();
    },
    //@{function} get code to test precondition which returns false to abort load
    test: function() {
      return this._.test || I.doNothing;
    }
  });
  I.know({
    //@param configures {[function]?} array with configure closures
    build: function(configures) {
      I.$super.build.call(this);
      const this_ = this._ = I.createTable();
      if (configures) {
        // run configure closures to populate table of this configuration
        configures.forEach(configure => configure(this_));
      }
    },
    unveil: function() {
      I.$super.unveil.call(this);
      Object.freeze(this._);
      Object.freeze(this);
    },
    //@ Install additional functionality from module configuration.
    //@param module {Std.Logic.Module} configured module
    //@return nothing
    installModule: I.doNothing
  });
})