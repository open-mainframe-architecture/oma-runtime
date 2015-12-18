'Trait'.subclass(function (I) {
  "use strict";
  // I describe objects that freeze after construction.
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      Object.freeze(this);
    }
  });
})