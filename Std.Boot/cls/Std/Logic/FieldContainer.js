// A container for logical fields.
'LogicalContainer'.subclass(function(I) {
  "use strict";
  I.know({
    //@param baseContainer {Std.Dictionary} base dictionary
    //@param homeContext {Std.Logic.Behavior} behavior that owns container
    //@param module {Std.Logic.Module} defining module
    build: function(baseContainer, homeContext, module) {
      I.$super.build.call(this, baseContainer, homeContext, baseContainer.getKey(), module);
    },
    checkStorage: function(it, ix) {
      return I.$super.checkStorage.call(this, it, ix) && I._.Field.describes(it);
    },
    //@ Get behavior that scopes this field container.
    //@return {Std.Logic.Behavior} scoping behavior
    getScope: I.burdenSubclass
  });
})