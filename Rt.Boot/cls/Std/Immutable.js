'Trait'.subclass(function (I) {
  "use strict";
  // I describe an object that freezes after construction.
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      Object.freeze(this);
    }
  });
})