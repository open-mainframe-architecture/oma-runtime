//@ A list value maps integer indices to element values.
'AbstractValue'.subclass(function(I) {
  "use strict";
  I.know({
    $difference: function(that) {
      var thisArray = this._, thatArray = that._, substitutions_ = I.createTable();
      var thisLength = thisArray.length, thatLength = thatArray.length;
      var minLength = thisLength < thatLength ? thisLength : thatLength;
      for (var i = 0; i < minLength; ++i) {
        var difference = I.compareValues(thisArray[i], thatArray[i]);
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
      return I.hasEnumerables(substitutions_) ? I._.Difference.create(substitutions_, true) :
        I._.Difference._.Zero;
    },
    $each: function(visit) {
      return this._.enumerate(visit, 1);
    },
    $equals: function(that) {
      var thisArray = this._, thatArray = that._;
      return thisArray.length === thatArray.length && thisArray.every(function(thisElement, i) {
        return I.equalValues(thisElement, thatArray[i]);
      });
    },
    $get: function(index) {
      return this._[index - 1];
    },
    $update: function(values_) {
      var elements = [], thisArray = this._, i = 0;
      for (var n = thisArray.length; i < n; ++i) {
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