//@ I describe an object that freezes after construction.
'Trait'.subclass(function (I) {
  "use strict";
  I.know({
    unveil: function () {
      I.$super.unveil.call(this);
      Object.freeze(this);
    }
  });
})