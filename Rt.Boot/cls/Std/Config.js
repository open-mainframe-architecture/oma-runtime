//@ An immutable configuration maps keys to configured values.
'Dictionary+Immutable'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ Build new configuration.
    //@param configures {[Rt.Closure]?} array with configure closures
    build: function (configures) {
      I.$super.build.call(this);
      if (configures) {
        // run configure closures to populate table of this configuration
        var this_ = this._ = I.createTable();
        configures.forEach(function (configure) { configure(this_); });
      }
    },
    //@ Get configured array. Default is empty array if not specified.
    //@param key {string} configuration key
    //@param array {[Any]?} configuration default
    //@return {[Any]} configured array
    //@except when configured value is not an array
    getArray: function (key, array) {
      var value = this.lookupDefault(arguments.length < 2 ? [] : array, key);
      if (Array.isArray(value)) {
        return value;
      }
      this.bad('array', key);
    },
    //@ Get configured code. Default is closure with empty body if not specified.
    //@param key {string} configuration key
    //@param code {Rt.Closure?} configuration default
    //@return {Rt.Closure} configured closure
    //@except when configured value is not a closure
    getClosure: function (key, code) {
      var value = this.lookupDefault(arguments.length < 2 ? I.doNothing : code, key);
      if (typeof value === 'function') {
        return value;
      }
      this.bad('closure', key);
    },
    //@ Get configured table. Default is empty table if not specified.
    //@param key {string} configuration key
    //@param object {Object} configuration default
    //@return {Rt.Table} configured table
    //@except when configured value is not a table
    getTable: function (key, object) {
      var value = this.lookupDefault(arguments.length < 2 ? {} : object, key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.assign(I.createTable(), value);
      }
      this.bad('object', key);
    },
    //@ Look up index if index is contained. Otherwise return with default for absent index.
    //@param absentDefault {any} default configuration
    //@param ix {string} index to look up
    //@return {any} configured value
    lookupDefault: function (absentDefault, ix) {
      return this.containsIndex(ix) ? this.lookup(ix) : absentDefault;
    }
  });
})