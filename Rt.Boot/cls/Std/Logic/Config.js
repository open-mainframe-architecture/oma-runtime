'Config'.subclass(function(I) {
  "use strict";
  // I describe module configurations.
  I.access({
    // names of modules that must be loaded
    depends: function() {
      return this.getArray('depends');
    },
    // factory code of service providers in module
    provides: function() {
      return this.getTable('provides');
    },
    // names of services that must be provided
    requires: function() {
      return this.getTable('requires');
    },
    // code to test precondition which returns false to abort load of module
    test: function() {
      return this.getClosure('test');
    }
  });
  I.know({
    // other modules refine this method for extra functionality in module configurations
    installModule: I.doNothing
  });
})