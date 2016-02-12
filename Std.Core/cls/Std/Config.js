function refine(I) {
  "use strict";
  I.know({
    //@ Get configured boolean.
    //@param key {string} configuration key
    //@param defaultValue {boolean?} default value if specified, otherwise false is default
    //@return {boolean} configured boolean
    //@except when configured value is not a boolean
    getBoolean: function (key, defaultValue) {
      var value = this.lookupDefault(arguments.length < 2 ? false : defaultValue, key);
      if (typeof value === 'boolean') {
        return value;
      }
      this.bad('boolean', key);
    },
    //@ Get configured number.
    //@param key {string} configuration key
    //@param defaultValue {number?} default value if specified, otherwise zero is default
    //@return {number} configured number
    //@except when configured value is not a number
    getNumber: function (key, defaultValue) {
      var value = this.lookupDefault(arguments.length < 2 ? 0 : defaultValue, key);
      if (typeof value === 'number') {
        return value;
      }
      this.bad('number', key);
    },
    //@ Get configured string.
    //@param key {string} configuration key
    //@param defaultValue {string?} default value if specified, otherwise empty string is default
    //@return {string} configured string
    //@except when configured value is not a string
    getString: function (key, string) {
      var value = this.lookupDefault(arguments.length < 2 ? '' : string, key);
      if (typeof value === 'string') {
        return value;
      }
      this.bad('string', key);
    }
  });
}