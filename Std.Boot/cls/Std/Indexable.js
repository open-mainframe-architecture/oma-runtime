//@ An indexable object enumerates indexed things.
'Trait'.subclass(I => {
  "use strict";
  I.know({
    //@ Test whether it is indexed by this indexable.
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is indexed by this this indexable, otherwise false
    contains: function(it) {
      return !this.enumerate(candidate => candidate !== it);
    },
    //@ Test whether this indexable indexes something at the index.
    //@param ix {any} index to test
    //@return {boolean} true if something is indexed at the index, otherwise false
    containsIndex: function(ix) {
      return !this.enumerate((ignore, candidateIx) => candidateIx !== ix);
    },
    //@ Enumerate indexed tings until visitor returns false.
    //@param visit {Std.Closure} closure is called with thing and its index
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: I.burdenSubclass,
    //@ Find thing at index. Found thing may not be indexed by this receiver.
    //@param ix {any} index where to find thing
    //@return {any} found thing or nothing
    find: function(ix) {
      return this.lookup(ix);
    },
    //@ Determine index of it in this indexable.
    //@param it {any} JavaScript object or value
    //@return {any} index or nothing
    indexOf: function(it) {
      let ix;
      this.enumerate((candidate, candidateIx) => {
        if (it === candidate) {
          ix = candidateIx;
          return false;
        }
      });
      return ix;
    },
    //@ Look up thing at index. Found thing must be indexed by this receiver.
    //@param ix {any} index where to look up thing
    //@return {any} thing or nothing
    lookup: function(ix) {
      let it;
      this.enumerate((candidate, candidateIx) => {
        if (ix === candidateIx) {
          it = candidate;
          return false;
        }
      });
      return it;
    },
    //@ Count number of indexable things in this indexable.
    //@return {integer} number of things
    size: function() {
      let n = 0;
      this.enumerate(() => { ++n; });
      return n;
    }
  });
})