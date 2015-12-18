'Dictionary+Logical'.subclass(function (I) {
  "use strict";
  // I describe dictionaries that hold substances of package fields.
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    build: function (basePackage, homeContext, module) {
      I.$super.build.call(this, basePackage);
      this.buildLogical(homeContext, basePackage.getKey(), module);
    },
    resolutionContext: function () {
      // a class package can be used to resolve package fields from the metaclass package 
      return this.getContext().$.getPackage();
    }
  });
})