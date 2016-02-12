//@ Difference between two data values in a compact format.
'BaseObject'.subclass(function (I) {
  "use strict";
  I.have({
    //@{any} undefined, an array, a table or a value
    compactMutation: null
  });
  I.know({
    //@param mutation {any|Rt.Table} updated value or table with updated child values
    //@param numericIndices {boolean?} true for numeric indices in replacement, otherwise false
    build: function (mutation, numericIndices) {
      I.$super.build.call(this);
      this.compactMutation = compact(mutation, numericIndices);
    },
    //@ Add this difference to an original value.
    //@param value {any} original value
    //@return {any} different value
    addTo: function (value) {
      // use recursive substitution function
      return this.isZero() ? value : substitute(this.compactMutation, value);
    },
    //@ Get compact mutation of this difference.
    //@return {any} undefined, array or value
    compact: function () {
      return this.compactMutation;
    },
    //@ Is this a bottom difference? A bottom difference defines the absence of a value.
    //@return {boolean} true if this is a bottom difference, otherwise false
    isBottom: function () {
      return this.compactMutation === void 0;
    },
    //@ Is this a root difference? A root difference defines one updated value.
    //@return {boolean} true if this is a root difference, otherwise false
    isRoot: function () {
      return I.Data.isValue(this.compactMutation);
    },
    //@ Is this a zero difference? Equal values have a zero difference.
    //@return {boolean} true if this is a zero difference, otherwise false
    isZero: function () {
      var mutation = this.compactMutation;
      return Array.isArray(mutation) && mutation.length === 0;
    }
  });
  I.setup({
    //@{Std.Data.Difference} bottom difference for value absence
    Bottom: function () {
      return I.$.create();
    },
    //@{Std.Data.Difference} zero difference for equal values
    Zero: function () {
      return I.$.create(Object.freeze([]));
    }
  });
  function compact(mutation, numericIndices) {
    if (!I.isTable(mutation)) {
      return mutation;
    }
    var n = 0, s;
    for (s in mutation) {
      if (++n > 1) {
        return mutation;
      }
    }
    var singleMutation = mutation[s], index = numericIndices ? parseInt(s, 10) : s;
    if (!Array.isArray(singleMutation)) {
      return [index, singleMutation];
    }
    singleMutation.unshift(index);
    return singleMutation;
  }
  function substitute(mutation, value, i) {
    if (I.Data.isValue(mutation)) {
      return mutation;
    }
    var values_, index;
    if (Array.isArray(mutation)) {
      values_ = I.createTable();
      index = mutation[i = i || 0];
      values_[index] = i < mutation.length - 2 ? substitute(mutation, value.$get(index), i + 1) :
        mutation[i + 1];
      return value.$update(values_);
    }
    if (I.isTable(mutation)) {
      values_ = I.createTable();
      for (index in mutation) {
        values_[index] = substitute(mutation[index], value.$get(index));
      }
      return value.$update(values_);
    }
  }
})