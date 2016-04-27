//@ An immutable configuration maps keys to configured values.
'Dictionary+Immutable'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@ Build new configuration.
    //@param configures {[Std.Closure]?} array with configure closures
    build: function(configures) {
      I.$super.build.call(this);
      if (configures) {
        // run configure closures to populate table of this configuration
        const this_ = this._ = I.createTable();
        for (let configure of configures) {
          configure(this_);
        }
      }
    },
    //@ Get configured array. Default is empty array if not specified.
    //@param key {string} configuration key
    //@param array {[Any]?} configuration default
    //@return {[Any]} configured array
    //@except when configured value is not an array
    getArray: function(key, array) {
      const value = this.lookupDefault(key, arguments.length < 2 ? [] : array);
      this.assert(Array.isArray(value));
      return value;
    },
    //@ Get configured code. Default is closure with empty body if not specified.
    //@param key {string} configuration key
    //@param code {Std.Closure?} configuration default
    //@return {Std.Closure} configured closure
    //@except when configured value is not a closure
    getClosure: function(key, code) {
      const value = this.lookupDefault(key, arguments.length < 2 ? I.doNothing : code);
      this.assert(I.isClosure(value));
      return value;
    },
    //@ Get configured table. Default is empty table if not specified.
    //@param key {string} configuration key
    //@param object {Object} configuration default
    //@return {Std.Table} configured table
    //@except when configured value is not a table
    getTable: function(key, object) {
      const value = this.lookupDefault(key, arguments.length < 2 ? {} : object);
      this.assert(value, typeof value === 'object', !Array.isArray(value));
      return Object.assign(I.createTable(), value);
    },
    //@ Look up index if index is contained. Otherwise return with default for absent index.
    //@param ix {string} index to look up
    //@param absentDefault {any} default configuration
    //@return {any} configured value
    lookupDefault: function(ix, absentDefault) {
      return this.containsIndex(ix) ? this.lookup(ix) : absentDefault;
    }
  });
})