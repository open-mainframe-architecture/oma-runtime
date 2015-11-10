'AbstractValue'.subclass(function(I) {
  "use strict";
  I.know({
    $at: function(index) {
      var this_ = this._, n = this._.length;
     return index >= 1 && index <= n && ~~index === index ? this_[index - 1] : this.$bad(index);
    },
    $each: function(visit) {
      var array = this._;
      for (var i = 0, n = array.length; i < n; ++i) {
        if (visit(array[i], i + 1) === false) {
          return false;
        }
      }
      return true;
    },
    $equals: function(that) {
      var thisArray = this._, thatArray = that._;
      if (thisArray.length !== thatArray.length) {
        return false;
      }
      for (var i = 0, n = thisArray.length; i < n; ++i) {
        if (!I.Datatype.equalValues(thisArray[i], thatArray[i])) {
          return false;
        }
      }
      return true;
    },
    $update: function(table) {
      var array = this._.slice();
      for (var index in table) {
        array[index - 1] = table[index];
      }
      return this.$type.createValue(this.$expr, array);
    }
  });
})