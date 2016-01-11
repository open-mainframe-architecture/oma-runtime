function refine(I) {
  "use strict";
  I.access({
    // concise description
    description: function () {
      return this.getString('description');
    },
    // prefix names of modules that are excluded from distribution
    excludes: function () {
      return this.getArray('excludes');
    },
    // prefix names of modules that are included in distribution
    includes: function () {
      return this.getArray('includes');
    },
    // module publishes public assets
    publishes: function () {
      return this.getTable('publishes');
    },
    // bundle releases modules from versioned archives
    releases: function () {
      return this.getTable('releases');
    },
    // versions of source archives
    sources: function () {
      return this.getTable('sources');
    },
    // semantic versions of source archives
    versions: function () {
      return this.getTable('versions');
    }
  });
}