'LogicalContainer'.subclass(function(I) {
  "use strict";
  // I describe containers that hold logical fields.
  I.know({
    build: function(baseContainer, homeContext, module) {
      I.$super.build.call(this, baseContainer, homeContext, baseContainer.getKey(), module);
    },
    // get behavior that scopes this field container
    getScope: I.burdenSubclass
  });
})