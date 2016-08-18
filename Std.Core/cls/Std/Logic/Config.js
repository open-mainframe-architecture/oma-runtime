function refine(I) {
  "use strict";
  I.access({
    //@{Std.Table} get info about versions of archive names in a bundle
    archives: function() {
      return this._.archives || I.createTable();
    },
    //@{string} get concise description of the module
    description: function() {
      return this._.description || 'Undocumented';
    },
    //@{[string]} get prefix names of modules that are excluded from distribution
    excludes: function() {
      return this._.excludes || [];
    },
    //@{[string]} get prefix names of modules that are included in distribution
    includes: function() {
      return this._.includes || [];
    },
    //@{Std.Table} get info about archives where modules from bundle reside
    modules: function() {
      return this._.modules || I.createTable();
    },
    //@{Std.Table} get info about public assets in module
    publishes: function() {
      return this._.publishes || I.createTable();
    },
    //@{Std.Table} get specified semantic versions of archives from bundle configuration
    versions: function() {
      return this._.versions || I.createTable();
    }
  });
}