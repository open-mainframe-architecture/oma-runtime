'BaseObject+Logical'.subclass(function (I) {
  "use strict";
  // I describe an instance or package field.
  I.have({
    // substance of this field, e.g. closure of method or value of constant
    fieldSubstance: null
  });
  I.know({
    build: function (context, key, module, substance) {
      I.$super.build.call(this);
      this.buildLogical(context, key, module);
      this.fieldSubstance = substance;
    },
    // get behavior that scopes this field
    getScope: function () {
      return this.getContext().getScope();
    },
    getSubstance: function () {
      return this.fieldSubstance;
    },
    // install new substance and return old substance of this field
    refineSubstance: function (substance, module) {
      var oldSubstance = this.fieldSubstance;
      this.fieldSubstance = substance;
      this.addModule(module);
      return oldSubstance;
    }
  });
})