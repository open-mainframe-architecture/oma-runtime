'Container'.subclass(function (I) {
  "use strict";
  // I describe a container whose indices form a linear sequence.
  I.know({
    walkUnsafe: function () {
      if (this.isEmpty()) {
        return I.Loop.Empty;
      }
      // inject first index and compute next index until last index has been iterated
      var self = this, last = this.lastIndex();
      return I.Loop.inject(Sentinel, this.firstIndex(), function (ix) {
        return ix === last ? Sentinel : self.nextIndex(ix);
      });
    },
    // get index of first element or an invalid index if this container is empty
    firstIndex: I.burdenSubclass,
    // get index of last element or the same invalid first index if empty
    lastIndex: I.burdenSubclass,
    // compute next index in the sequence of indices
    nextIndex: I.burdenSubclass
  });
  var Sentinel = {};
})