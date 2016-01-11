'FieldContainer'.subclass(function (I) {
  "use strict";
  // I describe a container that holds package fields.
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    checkStorage: function (it, ix) {
      return I.$super.checkStorage.call(this, it, ix) && I._.PackageField.describes(it);
    },
    getScope: function () {
      // the class owns the package fields
      return this.getContext().getContext();
    }
  });
})