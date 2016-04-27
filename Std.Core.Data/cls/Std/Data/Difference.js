//@ Difference between two data values in a compact format.
'BaseObject'.subclass(I => {
  "use strict";
  I.have({
    //@{any} undefined, an array, a table or a value
    compactSubstitution: null
  });
  I.know({
    //@param substitution {any|Std.Table} updated value or table with updated child values
    //@param arrayIndices {boolean?} true for array indices of updated children, otherwise false
    build: function(substitution, arrayIndices) {
      I.$super.build.call(this);
      if (I.isTable(substitution)) {
        let n = 0, s;
        for (s in substitution) {
          if (++n > 1) {
            break;
          }
        }
        if (n === 1) {
          const singleSubstitution = substitution[s], index = arrayIndices ? parseInt(s, 10) : s;
          if (Array.isArray(singleSubstitution)) {
            singleSubstitution.unshift(index);
            substitution = singleSubstitution;
          } else {
            substitution = [index, singleSubstitution];
          }
        }
      }
      this.compactSubstitution = substitution;
    },
    //@ Get compact format of this difference.
    //@return {any} undefined, array or value
    compact: function() {
      return this.compactSubstitution;
    },
    //@ Apply this difference on an original value.
    //@param value {any} original value
    //@return {any} different value
    exert: function(value) {
      return this.isZero() ? value : I.substitute(this.compactSubstitution, value);
    },
    //@ Is this a bottom difference? A bottom difference defines the absence of a value.
    //@return {boolean} true if this is a bottom difference, otherwise false
    isBottom: function() {
      return this.compactSubstitution === void 0;
    },
    //@ Is this a root difference? A root difference defines one updated value.
    //@return {boolean} true if this is a root difference, otherwise false
    isRoot: function() {
      return I.Data.isValue(this.compactSubstitution);
    },
    //@ Is this a zero difference? Equal values have a zero difference.
    //@return {boolean} true if this is a zero difference, otherwise false
    isZero: function() {
      const substitution = this.compactSubstitution;
      return Array.isArray(substitution) && substitution.length === 0;
    }
  });
  I.share({
    //@ Substitute values in original value.
    //@param compactSubstitition {any} compact difference
    //@param value {any} original value
    //@return {any?} updated value or nothing
    substitute: function(compactSubstitution, value, i) {
      if (I.Data.isValue(compactSubstitution)) {
        return compactSubstitution;
      }
      if (Array.isArray(compactSubstitution)) {
        const values_ = I.createTable();
        const index = compactSubstitution[i = i || 0];
        values_[index] = i < compactSubstitution.length - 2 ?
          I.substitute(compactSubstitution, value.$get(index), i + 1) :
          compactSubstitution[i + 1];
        return value.$update(values_);
      }
      if (I.isTable(compactSubstitution)) {
        const values_ = I.createTable();
        for (let index in compactSubstitution) {
          values_[index] = I.substitute(compactSubstitution[index], value.$get(index));
        }
        return value.$update(values_);
      }
    }
  });
  I.setup({
    //@{Std.Data.Difference} bottom difference for value absence
    Bottom: function() {
      return I.$.create();
    },
    //@{Std.Data.Difference} zero difference for equal values
    Zero: function() {
      return I.$.create(Object.freeze([]));
    }
  });
})