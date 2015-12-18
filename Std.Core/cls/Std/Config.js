function refine(I) {
  "use strict";
  I.know({
    // get configured boolean (default is false if not specified)
    getBoolean: function (key, boolean) {
      var value = this.lookupDefault(arguments.length < 2 ? false : boolean, key);
      if (typeof value === 'boolean') {
        return value;
      }
      this.bad('boolean', key);
    },
    // get configured number (default is zero if not specified)
    getNumber: function (key, number) {
      var value = this.lookupDefault(arguments.length < 2 ? 0 : number, key);
      if (typeof value === 'number') {
        return value;
      }
      this.bad('number', key);
    },
    // get configured string (default is empty string if not specified)
    getString: function (key, string) {
      var value = this.lookupDefault(arguments.length < 2 ? '' : string, key);
      if (typeof value === 'string') {
        return value;
      }
      this.bad('string', key);
    }
  });
}