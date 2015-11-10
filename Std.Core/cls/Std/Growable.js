'Trait'.subclass(function(I) {
  "use strict";
  // I describe objects that grow when arguments are added.
  I.know({
    // accumulate all elements from iterator
    accumulate: function(iterator) {
      var grown;
      for (grown = this; iterator.has(); iterator.step()) {
        grown = grown.add(iterator.get());
      }
      return grown;
    },
    add: I.burdenSubclass
  });
})