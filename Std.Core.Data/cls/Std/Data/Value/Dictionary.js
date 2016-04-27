//@ A dictionary value maps strings to element values.
'AbstractValue'.subclass(I => {
  "use strict";
  const Difference = I._.Difference;
  I.know({
    $difference: function(that) {
      const this_ = this._, that_ = that._, substitutions_ = I.createTable();
      const theseIndices = Object.keys(this_).sort(), thoseIndices = Object.keys(that_).sort();
      const n = theseIndices.length, m = thoseIndices.length;
      let i = 0, j = 0;
      while (i < n && j < m) {
        const thisIndex = theseIndices[i], thatIndex = thoseIndices[j];
        if (thisIndex < thatIndex) {
          substitutions_[thisIndex] = void 0;
          ++i;
        } else if (thisIndex === thatIndex) {
          const difference = I.compareValues(this_[thisIndex], that_[thatIndex]);
          if (!difference.isZero()) {
            substitutions_[thisIndex] = difference.compact();
          }
          ++i; ++j;
        } else {
          substitutions_[thatIndex] = that_[thatIndex];
          ++j;
        }
      }
      for (; i < n; ++i) {
        substitutions_[theseIndices[i]] = void 0;
      }
      for (; j < m; ++j) {
        substitutions_[thoseIndices[j]] = that_[thoseIndices[j]];
      }
      return I.hasEnumerables(substitutions_) ? Difference.create(substitutions_) :
        Difference._.Zero;
    },
    $each: function(visit) {
      const this_ = this._;
      for (let index in this_) {
        if (visit(this_[index], index) === false) {
          return false;
        }
      }
      return true;
    },
    $equals: function(that) {
      const this_ = this._, that_ = that._;
      // scope indices inside own block
      {
        const theseIndices = Object.keys(this_), thoseIndices = Object.keys(that_);
        if (theseIndices.length !== thoseIndices.length) {
          return false;
        }
        theseIndices.sort(); thoseIndices.sort();
        if (theseIndices.some((value, index) => value !== thoseIndices[index])) {
          return false;
        }
      }
      for (let index in this_) {
        if (!I.equalValues(this_[index], that_[index])) {
          return false;
        }
      }
      return true;
    },
    $update: function(values_) {
      const this_ = this._, elements_ = I.createTable();
      for (let index in this_) {
        if (I.isPropertyOwner(values_, index)) {
          if (values_[index] !== void 0) {
            elements_[index] = values_[index];
          }
        } else {
          elements_[index] = this_[index];
        }
      }
      for (let index in values_) {
        if (!I.isPropertyOwner(elements_, index) && values_[index] !== void 0) {
          elements_[index] = values_[index];
        }
      }
      return this.$type.createValue(this.$expr, elements_);
    }
  });
})