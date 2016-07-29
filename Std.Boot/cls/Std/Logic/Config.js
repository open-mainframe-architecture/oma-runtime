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
      return this.getArray('depends');
    },
    //@{Std.Table} get factory code of service providers in module
    provides: function() {
      return this.getTable('provides');
    },
    //@{Std.Table} get names of services that must be provided
    requires: function() {
      return this.getTable('requires');
    },
    //@{function} get code to test precondition which returns false to abort load
    test: function() {
      return this.getClosure('test');
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
    //@ Find configured thing at key. Otherwise return with default for absent key.
    //@param key {string} key to find
    //@param absentDefault {*} default configuration
    //@return {*} configured thing
    findDefault: function(key, absentDefault) {
      const this_ = this._;
      return I.isPropertyOwner(this_, key) ? this_[key] : absentDefault;
    },
    //@ Get configured array. Default is empty array if not specified.
    //@param key {string} configuration key
    //@param array {[*]?} configuration default
    //@return {[*]} configured array
    getArray: function(key, array) {
      return this.findDefault(key, I.isDefined(array) ? array : []);
    },
    //@ Get configured code. Default is closure with empty body if not specified.
    //@param key {string} configuration key
    //@param closure {function?} configuration default
    //@return {function} configured closure
    getClosure: function(key, closure) {
      return this.findDefault(key, I.isDefined(closure) ? closure : I.doNothing);
    },
    //@ Get configured table. Default is empty table if not specified.
    //@param key {string} configuration key
    //@param object {Object} configuration default
    //@return {Std.Table} configured table
    getTable: function(key, object) {
      const value = this.findDefault(key, I.isDefined(object) ? object : {});
      return Object.assign(I.createTable(), value);
    },
    //@ Install additional functionality from module configuration.
    //@param module {Std.Logic.Module} configured module
    //@return nothing
    installModule: I.doNothing
  });
})