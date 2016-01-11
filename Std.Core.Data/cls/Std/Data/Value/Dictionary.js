'AbstractValue'.subclass(function (I) {
  "use strict";
  I.know({
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
        if (!I.Datatype.equalValues(this_[index], that_[index])) {
          return false;
        }
      }
      return true;
    }
  });
})