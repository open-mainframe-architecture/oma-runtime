'Trait'.subclass(function (I) {
  "use strict";
  // I describe an object that can enumerate indexed elements.
  I.know({
    // test whether it is indexed by this indexable
    contains: function (it) {
      return !this.enumerate(function (elem) { return elem !== it; });
    },
    // test whether ix is an index in this indexable
    containsIndex: function (ix) {
      return !this.enumerate(function (elem, elemIx) { return elemIx !== ix; });
    },
    // enumerate indexed elements until visitor returns false
    enumerate: I.burdenSubclass,
    // relaxed find might have a broader scope and be more forgiving than strict lookup
    find: function (ix) {
      return this.lookup(ix);
    },
    // find index of it in this indexable
    indexOf: function (it) {
      var ix;
      this.enumerate(function (elem, elemIx) {
        if (it === elem) {
          ix = elemIx;
          return false;
        }
      });
      return ix;
    },
    // strict lookup of indexed element in this indexable
    lookup: function (ix) {
      var it;
      this.enumerate(function (elem, elemIx) {
        if (ix === elemIx) {
          it = elem;
          return false;
        }
      });
      return it;
    },
    // count number of indexable elements in this indexable
    size: function () {
      var n = 0;
      this.enumerate(function () { ++n; });
      return n;
    }
  });
})