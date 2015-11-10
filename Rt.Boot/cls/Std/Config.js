'Dictionary+Immutable'.subclass(function(I) {
  "use strict";
  // I describe an immutable configuration that maps keys to configured values.
  I.am({
    Abstract: false
  });
  I.know({
    build: function(configures) {
      I.$super.build.call(this);
      if (configures) {
        // run configure closures to populate table of this configuration
        var this_ = this._ = I.createTable();
        configures.forEach(function(configure) { configure(this_); });
      }
    },
    // get configured array (default is empty array if not specified)
    getArray: function(key, array) {
      var value = this.lookupDefault(arguments.length < 2 ? [] : array, key);
      if (Array.isArray(value)) {
        return value;
      }
      this.bad('array', key);
    },
    // get configured code (default is closure with empty body if not specified)
    getClosure: function(key, code) {
      var value = this.lookupDefault(arguments.length < 2 ? I.doNothing : code, key);
      if (typeof value === 'function') {
        return value;
      }
      this.bad('closure', key);
    },
    // get configured table (default is empty table if not specified)
    getTable: function(key, object) {
      var value = this.lookupDefault(arguments.length < 2 ? {} : object, key);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return I.assign(I.createTable(), value);
      }
      this.bad('object', key);
    },
    // lookup index if index is contained, otherwise return with default for absent index
    lookupDefault: function(absentDefault, ix) {
      return this.containsIndex(ix) ? this.lookup(ix) : absentDefault;
    }
  });
})