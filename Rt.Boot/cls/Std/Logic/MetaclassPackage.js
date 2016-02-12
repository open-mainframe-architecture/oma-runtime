//@ A container with package fields.
'FieldContainer'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    checkStorage: function (it, ix) {
      return I.$super.checkStorage.call(this, it, ix) && I._.PackageField.describes(it);
    },
    //@return {Std.Logic.Class} class scopes package fields
    getScope: function () {
      return this.getContext().getContext();
    }
  });
})