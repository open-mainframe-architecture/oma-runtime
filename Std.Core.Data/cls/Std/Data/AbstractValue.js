'Void'.subclass(function (I) {
  "use strict";
  // I describe immutable list, dictionary and record values.
  I.know({
    // data type classifies this composed value as a member of list, dictionary or record type
    $type: null,
    // type expression restricts type of this value
    $expr: null,
    // frozen array (list) or frozen table (dictionary or record) with child values
    _: null,
    // get child at index
    $at: function (index) {
      return I.isPropertyOwner(this._, index) ? this._[index] : this.$bad(index);
    },
    // abort with error
    $bad: function () {
      throw I._.Failure.create(this, I._.BaseObject._.slice(arguments));
    },
    // enumerate children
    $each: function (visit) {
      var this_ = this._;
      for (var index in this_) {
        if (visit(this_[index], index) === false) {
          return false;
        }
      }
      return true;
    },
    // test deep equality with that other value of same type and expression
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
    },
    // create updated value that merges indexed child values from table
    $update: function (table) {
      var this_ = this._;
      for (var index in this_) {
        if (!(index in table)) {
          table[index] = this_[index];
        }
      }
      return this.$type.createValue(this.$expr, table);
    }
  });
})