//@ The indices of a sequenceable container form a linear sequence.
'Container'.subclass(function (I) {
  "use strict";
  I.know({
    walkUnsafe: function () {
      return this.isEmpty() ? I.Loop.Empty :
        // walk over index sequence while sentinel index is not encountered
        I.Loop.whilst(this.firstIndex(), isNotSentinel, advance.bind(this));
    },
    //@ Get index of first element or an invalid index if this container is empty.
    //@return {any} first or invalid index
    firstIndex: I.burdenSubclass,
    //@ Get index of last element or an invalid index if this container is empty.
    //@return {any} last or invalid index
    lastIndex: I.burdenSubclass,
    //@ Compute next index in the sequence of indices.
    //@param ix {any} index in sequence
    //@return {any} next index in sequence
    nextIndex: I.burdenSubclass
  });
  // use sentinel 'index' to stop walking over indices
  var SentinelIndex = {};
  function isNotSentinel(ix) { return ix !== SentinelIndex; }
  function advance(ix) { //jshint validthis:true
    return ix === this.lastIndex() ? SentinelIndex : this.nextIndex(ix);
  }
})