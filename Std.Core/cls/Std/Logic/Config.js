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
}