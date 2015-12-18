'Object'.subclass(Array, function (I) {
  "use strict";
  I.know({
    accumulate: function (iterator) {
      for (; iterator.has(); iterator.step()) {
        this.push(iterator.get());
      }
      return this;
    },
    enumerate: function (visit, firstIndex) {
      return I.enumerate(this, visit, firstIndex);
    },
    walk: function () {
      return I.walk(this);
    }
  });
  I.share({
    enumerate: function (arrayLike, visit, firstIndex) {
      for (var i = 0, n = arrayLike.length, offset = firstIndex || 0; i < n; ++i) {
        if (visit(arrayLike[i], i + offset) === false) {
          return false;
        }
      }
      return true;
    },
    walk: function (arrayLike) {
      return arrayLike.length ? I.Iterator.create(arrayLike) : I.Loop.Empty;
    }
  });
  I.nest({
    Iterator: 'Std.Iterator'.subclass(function (I) {
      // I describe iterators that walk over elements in an array (or array-like object).
      I.have({
        // iterated array
        array: null,
        // current zero-based index of this iterator in array
        index: 0
      });
      I.know({
        build: function (array) {
          I.$super.build.call(this);
          this.array = array;
        },
        get: function () {
          return this.array[this.index];
        },
        has: function () {
          return this.index < this.array.length;
        },
        step: function () {
          ++this.index;
        }
      });
    })
  });
})