//@ The indices of a sequenceable container form a linear sequence.
'Container'.subclass(I => {
  "use strict";
  const SENTINEL = Symbol();
  I.know({
    walkUnsafe: function() {
      // walk over index sequence until sentinel index is encountered
      return I.Loop.whilst(this.firstIndex(SENTINEL), isIndex, ix => this.nextIndex(ix, SENTINEL));
    },
    //@ Get index of first element.
    //@param sentinel {any} sentinel result if sequence is empty
    //@return {any} first index or sentinel result
    firstIndex: I.burdenSubclass,
    //@ Compute next index in the sequence of indices.
    //@param ix {any} index in sequence
    //@param sentinel {any} sentinel result if index is last in sequence
    //@return {any} next index in sequence or sentinel result
    nextIndex: I.burdenSubclass
  });
  // use sentinel 'index' to stop walking over indices
  function isIndex(ix) { return ix !== SENTINEL; }
})