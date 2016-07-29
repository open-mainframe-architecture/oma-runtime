function refine(I) {
  "use strict";
  I.access({
    //@{Std.Table} get info about versions of archive names in a bundle
    archives: function() {
      return this.getTable('archives');
    },
    //@{string} get concise description of the module
    description: function() {
      return this.getString('description');
    },
    //@{[string]} get prefix names of modules that are excluded from distribution
    excludes: function() {
      return this.getArray('excludes');
    },
    //@{[string]} get prefix names of modules that are included in distribution
    includes: function() {
      return this.getArray('includes');
    },
    //@{Std.Table} get info about archives where modules from bundle reside
    modules: function() {
      return this.getTable('modules');
    },
    //@{Std.Table} get info about public assets in module
    publishes: function() {
      return this.getTable('publishes');
    },
    //@{Std.Table} get specified semantic versions of archives from bundle configuration
    versions: function() {
      return this.getTable('versions');
    }
  });
  I.know({
    //@ Get configured boolean.
    //@param key {string} configuration key
    //@param boolean {boolean?} default value if specified, otherwise false is default
    //@return {boolean} configured boolean
    getBoolean: function(key, boolean) {
      return this.findDefault(key, I.isDefined(boolean) ? boolean : false);
    },
    //@ Get configured number.
    //@param key {string} configuration key
    //@param number {number?} default value if specified, otherwise zero is default
    //@return {number} configured number
    getNumber: function(key, number) {
      return this.findDefault(key, I.isDefined(number) ? number : 0);
    },
    //@ Get configured string.
    //@param key {string} configuration key
    //@param string {string?} default value if specified, otherwise empty string is default
    //@return {string} configured string
    getString: function(key, string) {
      return this.findDefault(key, I.isDefined(string) ? string : '');
    }
  });
}