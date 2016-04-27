//@ A list value maps integer indices to element values.
'AbstractValue'.subclass(I => {
  "use strict";
  const Difference = I._.Difference;
  I.know({
    $difference: function(that) {
      const thisArray = this._, thatArray = that._, substitutions_ = I.createTable();
      const thisLength = thisArray.length, thatLength = thatArray.length;
      const minLength = thisLength < thatLength ? thisLength : thatLength;
      let i = 0;
      for (; i < minLength; ++i) {
        const difference = I.compareValues(thisArray[i], thatArray[i]);
        if (!difference.isZero()) {
          substitutions_[i + 1] = difference.compact();
        }
      }
      if (thisLength > thatLength) {
        substitutions_[i + 1] = void 0;
      } else if (thisLength < thatLength) {
        for (; i < thatLength; ++i) {
          substitutions_[i + 1] = thatArray[i];
        }
      }
      return I.hasEnumerables(substitutions_) ? Difference.create(substitutions_, true) :
        Difference._.Zero;
    },
    $each: function(visit) {
      return this._.enumerate(visit, 1);
    },
    $equals: function(that) {
      const thisArray = this._, thatArray = that._;
      return thisArray.length === thatArray.length &&
        thisArray.every((thisElement, i) => I.equalValues(thisElement, thatArray[i]));
    },
    $get: function(index) {
      return this._[index - 1];
    },
    $update: function(values_) {
      const elements = [], thisArray = this._, n = thisArray.length;
      let i = 0;
      for (; i < n; ++i) {
        if (!I.isPropertyOwner(values_, i + 1)) {
          elements[i] = thisArray[i];
        } else if (values_[i + 1] !== void 0) {
          elements[i] = values_[i + 1];
        } else {
          return this.$type.createValue(this.$expr, elements);
        }
      }
      for (; I.isPropertyOwner(values_, i + 1); ++i) {
        elements[i] = values_[i + 1];
      }
      return this.$type.createValue(this.$expr, elements);
    }
  });
})