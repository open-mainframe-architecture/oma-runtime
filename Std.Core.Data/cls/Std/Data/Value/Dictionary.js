//@ A dictionary value maps strings to element values.
'Value.Object'.subclass(I => {
  "use strict";
  I.access({
    $indices: function() {
      return Object.keys(this._)[Symbol.iterator]();
    }
  });
  const Difference = I._.Difference;
  I.know({
    $compare: function(that) {
      const this_ = this._, that_ = that._, substitutions = I.createTable();
      const theseIndices = Object.keys(this_).sort(), thoseIndices = Object.keys(that_).sort();
      const n = theseIndices.length, m = thoseIndices.length;
      let i = 0, j = 0;
      while (i < n && j < m) {
        const thisIndex = theseIndices[i], thatIndex = thoseIndices[j];
        if (thisIndex < thatIndex) {
          substitutions[thisIndex] = void 0;
          ++i;
        } else if (thisIndex === thatIndex) {
          const difference = I.compareValues(this_[thisIndex], that_[thatIndex]);
          if (!difference.isZero()) {
            substitutions[thisIndex] = difference.compact();
          }
          ++i; ++j;
        } else {
          substitutions[thatIndex] = that_[thatIndex];
          ++j;
        }
      }
      for (; i < n; ++i) {
        substitutions[theseIndices[i]] = void 0;
      }
      for (; j < m; ++j) {
        substitutions[thoseIndices[j]] = that_[thoseIndices[j]];
      }
      return I.hasEnumerables(substitutions) ? Difference.create(substitutions) :
        Difference._.Zero;
    },
    $equals: function(that) {
      const this_ = this._, that_ = that._;
      const theseIndices = Object.keys(this_), thoseIndices = Object.keys(that_);
      if (theseIndices.length !== thoseIndices.length) {
        return false;
      }
      theseIndices.sort(); thoseIndices.sort();
      if (theseIndices.some((value, index) => value !== thoseIndices[index])) {
        return false;
      }
      for (let index in this_) {
        if (!I.Data.equals(this_[index], that_[index])) {
          return false;
        }
      }
      return true;
    },
    $select: function(index) {
      return this._[index];
    },
    $update: function(values) {
      const this_ = this._, elements = I.createTable();
      for (let index in this_) {
        if (I.isPropertyOwner(values, index)) {
          if (values[index] !== void 0) {
            elements[index] = values[index];
          }
        } else {
          elements[index] = this_[index];
        }
      }
      for (let index in values) {
        if (!I.isPropertyOwner(elements, index) && values[index] !== void 0) {
          elements[index] = values[index];
        }
      }
      return this.$type.createValue(this.$expr, elements);
    }
  });})