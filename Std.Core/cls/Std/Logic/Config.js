function refine(I) {
  "use strict";
  I.access({
    //@{string} get concise description of the module
    description: function () {
      return this.getString('description');
    },
    //@{[string]} get prefix names of modules that are excluded from distribution
    excludes: function () {
      return this.getArray('excludes');
    },
    //@{[string]} get prefix names of modules that are included in distribution
    includes: function () {
      return this.getArray('includes');
    },
    //@{Rt.Table} get info about public assets in module
    publishes: function () {
      return this.getTable('publishes');
    },
    //@{Rt.Table} get info about archive versions where modules from bundle reside
    releases: function () {
      return this.getTable('releases');
    },
    //@{Rt.Table} get info about versions of archive names in a bundle
    sources: function () {
      return this.getTable('sources');
    },
    //@{Rt.Table} get specified semantic versions of archives from bundle configuration
    versions: function () {
      return this.getTable('versions');
    }
  });
}