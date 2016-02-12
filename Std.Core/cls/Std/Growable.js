//@ A growable object grows when arguments are added.
'Trait'.subclass(function (I) {
  "use strict";
  I.know({
    //@ Accumulate all things from iterator. This may be destructive.
    //@param iterator {Std.Iterator} iterator over things to add
    //@return {Std.Growable} this receiver or a new growable object
    accumulate: function (iterator) {
      var grown = this;
      for (; iterator.has(); iterator.step()) {
        grown = grown.add(iterator.get());
      }
      return grown;
    },
    //@ Add things to let it grow. This may be destructive.
    //@param ... {any} things to add
    //@return {Std.Growable} this receiver or a new growable object
    add: I.burdenSubclass
  });
})