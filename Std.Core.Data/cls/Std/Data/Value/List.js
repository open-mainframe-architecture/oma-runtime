//@ A list value maps integer indices to element values.
'Value.Object'.subclass(I => {
  "use strict";
  I.access({
    $indices: function* () {
      const n = this._.length;
      for (let i = 1; i <= n; ++i) {
        yield i;
      }
    }
  });
  const Difference = I._.Difference;
  I.know({
    $compare: function(that) {
      const thisArray = this._, thatArray = that._, substitutions = I.createTable();
      const thisLength = thisArray.length, thatLength = thatArray.length;
      const minLength = thisLength < thatLength ? thisLength : thatLength;
      let i = 0;
      for (; i < minLength; ++i) {
        const difference = I.Data.compare(thisArray[i], thatArray[i]);
        if (!difference.isZero()) {
          substitutions[i + 1] = difference.compact();
        }
      }
      if (thisLength > thatLength) {
        substitutions[i + 1] = void 0;
      } else if (thisLength < thatLength) {
        for (; i < thatLength; ++i) {
          substitutions[i + 1] = thatArray[i];
        }
      }
      return I.hasEnumerables(substitutions) ? Difference.create(substitutions, true) :
        Difference._.Zero;
    },
    $equals: function(that) {
      const thisArray = this._, thatArray = that._;
      return thisArray.length === thatArray.length &&
        thisArray.every((thisElement, i) => I.Data.equals(thisElement, thatArray[i]));
    },
    $select: function(index) {
      return this._[index - 1];
    },
    $update: function(values) {
      const elements = [], thisArray = this._, n = thisArray.length;
      let i = 0;
      for (; i < n; ++i) {
        if (!I.isPropertyOwner(values, i + 1)) {
          elements[i] = thisArray[i];
        } else if (values[i + 1] !== void 0) {
          elements[i] = values[i + 1];
        } else {
          return this.$type.createValue(this.$expr, elements);
        }
      }
      for (; I.isPropertyOwner(values, i + 1); ++i) {
        elements[i] = values[i + 1];
      }
      return this.$type.createValue(this.$expr, elements);
    }
  });
})