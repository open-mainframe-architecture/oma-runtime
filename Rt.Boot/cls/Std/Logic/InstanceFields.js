//@ A container with instance fields.
'FieldContainer'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    checkStorage: function (it, ix) {
      return I.$super.checkStorage.call(this, it, ix) && I._.InstanceField.describes(it);
    },
    getScope: function () {
      return this.getContext();
    }
  });
})