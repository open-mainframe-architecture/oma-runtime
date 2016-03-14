//@ A container with package fields.
'FieldContainer'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    //@return {Std.Logic.Class} class scopes package fields
    getScope: function() {
      return this.getContext().getContext();
    }
  });
})