//@ A container with instance fields.
'FieldContainer'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    getScope: function() {
      return this.getContext();
    }
  });
})