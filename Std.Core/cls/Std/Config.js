function refine(I) {
  "use strict";
  I.know({
    //@ Get configured boolean.
    //@param key {string} configuration key
    //@param defaultValue {boolean?} default value if specified, otherwise false is default
    //@return {boolean} configured boolean
    //@except when configured value is not a boolean
    getBoolean: function(key, defaultValue) {
      const value = this.lookupDefault(key, arguments.length < 2 ? false : defaultValue);
      this.assert(typeof value === 'boolean');
      return value;
    },
    //@ Get configured number.
    //@param key {string} configuration key
    //@param defaultValue {number?} default value if specified, otherwise zero is default
    //@return {number} configured number
    //@except when configured value is not a number
    getNumber: function(key, defaultValue) {
      const value = this.lookupDefault(key, arguments.length < 2 ? 0 : defaultValue);
      this.assert(typeof value === 'number');
      return value;
    },
    //@ Get configured string.
    //@param key {string} configuration key
    //@param defaultValue {string?} default value if specified, otherwise empty string is default
    //@return {string} configured string
    //@except when configured value is not a string
    getString: function(key, string) {
      const value = this.lookupDefault(key, arguments.length < 2 ? '' : string);
      this.assert(typeof value === 'string');
      return value;
    }
  });
}