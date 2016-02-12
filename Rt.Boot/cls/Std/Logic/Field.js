//@ An instance or package field.
'BaseObject+Logical'.subclass(function (I) {
  "use strict";
  I.have({
    //@{any} substance of this field, e.g. closure of method or value of constant
    fieldSubstance: null
  });
  I.know({
    //@param context {Std.Logic.InstanceField|Std.Logic.PackageFields} field context
    //@param key {string} field key
    //@param module {Std.Logic.Module} defining module of field
    //@param substance {any} field substance
    build: function (context, key, module, substance) {
      I.$super.build.call(this);
      this.buildLogical(context, key, module);
      this.fieldSubstance = substance;
    },
    //@ Get behavior that scopes this field.
    //@return {Std.Logic.Behavior} behavior
    getScope: function () {
      return this.getContext().getScope();
    },
    //@ Get field substance.
    //@return {any} substance of this field
    getSubstance: function () {
      return this.fieldSubstance;
    },
    //@ Install new substance.
    //@param substance {any} refined substance
    //@param module {Std.Logic.Module} refining module
    //@return old substance before refinement
    refineSubstance: function (substance, module) {
      var oldSubstance = this.fieldSubstance;
      this.fieldSubstance = substance;
      this.addModule(module);
      return oldSubstance;
    }
  });
})