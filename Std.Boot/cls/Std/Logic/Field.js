//@ An instance or package field.
'BaseObject+Logical'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{any} substance of this field, e.g. closure of method or value of constant
    fieldSubstance: null,
    //@{boolean} true if field has variable substance, i.e. instance variable
    variableSubstance: null
  });
  I.know({
    //@param context {Std.Logic.InstanceFields|Std.Logic.MetaclassPackage} field context
    //@param key {string} field key
    //@param module {Std.Logic.Module} defining module of field
    //@param substance {any} field substance
    //@param variable {boolean} true if substance is variable, otherwise false
    build: function(context, key, module, substance, variable) {
      I.$super.build.call(this);
      this.buildLogical(context, key, module);
      this.fieldSubstance = substance;
      this.variableSubstance = variable;
    },
    //@ Get behavior that scopes this field.
    //@return {Std.Logic.Behavior} behavior
    getScope: function() {
      return this.getContext().getScope();
    },
    //@ Get field substance.
    //@return {any} substance of this field
    getSubstance: function() {
      return this.fieldSubstance;
    },
    //@ Is the substance of this field defined?
    //@return {boolean} true if substance is defined, otherwise false
    hasSubstance: function() {
      return I.isDefined(this.fieldSubstance);
    },
    //@ Is this a variable field?
    //@return {boolean} true if field is variable, otherwise false
    isVariable: function() {
      return this.variableSubstance;
    },
    //@ Install new substance.
    //@param substance {any} refined substance
    //@param module {Std.Logic.Module} refining module
    //@return old substance before refinement
    refineSubstance: function(substance, module) {
      const oldSubstance = this.fieldSubstance;
      this.fieldSubstance = substance;
      this.addModule(module);
      return oldSubstance;
    }
  });
})