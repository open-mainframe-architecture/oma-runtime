// A class package holds substances of package fields.
'Dictionary+Logical'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    //@param basePackage {Std.Logic.Dictionary} base dictionary
    //@param homeContext {Std.Logic.Class} class is context of package
    //@param module {Std.Logic.Module} defining module
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