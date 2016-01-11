'Trait'.subclass(function (I) {
  "use strict";
  // I describe an object that grows when arguments are added.
  I.know({
    // accumulate all elements from iterator
    accumulate: function (iterator) {
      var grown = this;
      for (; iterator.has(); iterator.step()) {
        grown = grown.add(iterator.get());
      }
      return grown;
    },
    add: I.burdenSubclass
  });
})