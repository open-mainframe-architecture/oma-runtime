//@ A dictionary value maps strings to element values.
'AbstractValue'.subclass(function (I) {
  "use strict";
  I.know({
    $difference: function (that) {
      var this_ = this._, that_ = that._, mutations_ = I.createTable();
      var theseIndices = Object.keys(this_).sort(), thoseIndices = Object.keys(that_).sort();
      var i = 0, j = 0, n = theseIndices.length, m = thoseIndices.length;
      while (i < n && j < m) {
        var thisIndex = theseIndices[i], thatIndex = thoseIndices[j];
        if (thisIndex < thatIndex) {
          mutations_[thisIndex] = void 0;
          ++i;
        } else if (thisIndex === thatIndex) {
          var difference = I.compareValues(this_[thisIndex], that_[thatIndex]);
          if (!difference.isZero()) {
            mutations_[thisIndex] = difference.compact();
          }
          ++i; ++j;
        } else {
          mutations_[thatIndex] = that_[thatIndex];
          ++j;
        }
      }
      for (; i < n; ++i) {
        mutations_[theseIndices[i]] = void 0;
      }
      for (; j < m; ++j) {
        mutations_[thoseIndices[j]] = that_[thoseIndices[j]];
      }
      return I.hasEnumerables(mutations_) ? I._.Difference.create(mutations_) :
        I._.Difference._.Zero;
    },
    $each: function (visit) {
      var this_ = this._;
      for (var index in this_) {
        if (visit(this_[index], index) === false) {
          return false;
        }
      }
      return true;
    },
    $equals: function (that) {
      var this_ = this._, that_ = that._;
      var theseIndices = Object.keys(this_), thoseIndices = Object.keys(that_);
      if (theseIndices.length !== thoseIndices.length) {
        return false;
      }
      theseIndices.sort(); thoseIndices.sort();
      if (theseIndices.some(function (value, index) { return value !== thoseIndices[index]; })) {
        return false;
      }
      theseIndices = thoseIndices = null;
      for (var index in this_) {
        if (!I.equalValues(this_[index], that_[index])) {
          return false;
        }
      }
      return true;
    },
    $update: function (values_) {
      var this_ = this._, elements_ = I.createTable(), index;
      for (index in this_) {
        if (I.isPropertyOwner(values_, index)) {
          if (values_[index] !== void 0) {
            elements_[index] = values_[index];
          }
        } else {
          elements_[index] = this_[index];
        }
      }
      for (index in values_) {
        if (!I.isPropertyOwner(elements_, index) && values_[index] !== void 0) {
          elements_[index] = values_[index];
        }
      }
      return this.$type.createValue(this.$expr, elements_);
    }
  });
})