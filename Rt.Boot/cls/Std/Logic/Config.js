//@ A module configuration.
'Config'.subclass(function (I) {
  "use strict";
  I.access({
    //@{[string]} get names of modules that must be loaded
    depends: function () {
      return this.getArray('depends');
    },
    //@{Rt.Table} get factory code of service providers in module
    provides: function () {
      return this.getTable('provides');
    },
    //@{Rt.Table} get names of services that must be provided
    requires: function () {
      return this.getTable('requires');
    },
    //@{Rt.Closure} get code to test precondition which returns false to abort load of module
    test: function () {
      return this.getClosure('test');
    }
  });
  I.know({
    //@ Install additional functionality from module configurations.
    //@param module {Std.Logic.Module} configured module
    //@return nothing
    installModule: I.doNothing
  });
})