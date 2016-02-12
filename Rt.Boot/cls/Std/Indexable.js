//@ An indexable object enumerates indexed things.
'Trait'.subclass(function (I) {
  "use strict";
  I.know({
    //@ Test whether it is indexed by this indexable.
    //@param it {any} JavaScript object or value
    //@return {boolean} true if it is indexed by this this indexable, otherwise false
    contains: function (it) {
      return !this.enumerate(function (thing) { return thing !== it; });
    },
    //@ Test whether this indexable indexes something at the index.
    //@param ix {any} index to test
    //@return {boolean} true if something is indexed at the index, otherwise false
    containsIndex: function (ix) {
      return !this.enumerate(function (ignore, thingIx) { return thingIx !== ix; });
    },
    //@ Enumerate indexed tings until visitor returns false.
    //@param visit {Rt.Closure} closure is called with thing and its index
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: I.burdenSubclass,
    //@ Find thing at index. Found thing may not be indexed by this receiver.
    //@param ix {any} index where to find thing
    //@return {any} found thing or nothing
    find: function (ix) {
      return this.lookup(ix);
    },
    //@ Determine index of it in this indexable.
    //@param it {any} JavaScript object or value
    //@return {any} index or nothing
    indexOf: function (it) {
      var ix;
      this.enumerate(function (thing, thingIx) {
        if (it === thing) {
          ix = thingIx;
          return false;
        }
      });
      return ix;
    },
    //@ Look up thing at index. Found thing must be indexed by this receiver.
    //@param ix {any} index where to look up thing
    //@return {any} thing or nothing
    lookup: function (ix) {
      var it;
      this.enumerate(function (thing, thingIx) {
        if (ix === thingIx) {
          it = thing;
          return false;
        }
      });
      return it;
    },
    //@ Count number of indexable things in this indexable.
    //@return {integer} number of things
    size: function () {
      var n = 0;
      this.enumerate(function () { ++n; });
      return n;
    }
  });
})