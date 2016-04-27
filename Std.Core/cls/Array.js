'Object'.subclass(Array, I => {
  "use strict";
  I.know({
    //@ Visit elements of this array.
    //@param visit {Std.Closure} called with element and index
    //@param offset {integer?} optional offset from zero-based array index
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: function(visit, offset) {
      return I.enumerate(this, visit, offset);
    },
    //@ Create iterator over array elements. The iterator assumes this array is not modified.
    //@return {Std.Iterator} iterator over array elements
    walk: function() {
      return I.walk(this);
    }
  });
  I.share({
    //@ Visit elements of array-like object.
    //@param arrayLike {[any]} array or array-like object, e.g. arguments
    //@param visit {Std.Closure} called with element and index
    //@param offset {integer?} optional offset from zero-based array index
    //@return {boolean} false if some visit returned false, otherwise true
    enumerate: function(arrayLike, visit, offset) {
      offset = offset || 0;
      const n = arrayLike.length;
      for (let i = 0; i < n; ++i) {
        if (visit(arrayLike[i], i + offset) === false) {
          return false;
        }
      }
      return true;
    },
    //@ Create iterator over elements in array-like object.
    //@param arrayLike {[any]} array or array-like object, e.g. arguments
    //@return {Std.Iterator} iterator over array elements
    walk: function(arrayLike) {
      return arrayLike.length ? I.Iterator.create(arrayLike) : I.Loop.Empty;
    }
  });
  I.nest({
    //@ An iterator over elements of array or array-like object.
    Iterator: 'Std.Iterator'.subclass(function(I) {
      I.have({
        //@{[any]} iterated array or array-like object
        array: null,
        //@{integer} current zero-based index of this iterator in the array
        index: 0
      });
      I.know({
        //@param array {[any]} array to iterate
        build: function(array) {
          I.$super.build.call(this);
          this.array = array;
        },
        get: function() {
          return this.array[this.index];
        },
        has: function() {
          return this.index < this.array.length;
        },
        step: function() {
          ++this.index;
        }
      });
    })
  });
})