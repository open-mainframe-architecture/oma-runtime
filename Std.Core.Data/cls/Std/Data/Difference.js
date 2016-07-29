//@ Difference between two data values in a compact format.
'Object'.subclass(I => {
  "use strict";
  I.have({
    //@{*} undefined, an array, a table or a value
    compactSubstitution: null
  });
  I.know({
    //@param substitution {*|Std.Table} updated value or table with updated child values
    //@param arrayIndices {boolean?} true for array indices of updated children
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
    //@return {*} undefined, array, table or value
    compact: function() {
      return this.compactSubstitution;
    },
    //@ Apply this difference on an original value.
    //@param value {*} original value
    //@return {*} different value
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
    //@param compactSubstitition {*} compact difference
    //@param value {*} original value
    //@param i {integer?} array index of recursive call if compact difference is an array
    //@return {*} updated value or nothing
    substitute: (compactSubstitution, value, i) => {
      if (I.Data.isValue(compactSubstitution)) {
        return compactSubstitution;
      }
      if (Array.isArray(compactSubstitution)) {
        const values = I.createTable();
        const index = compactSubstitution[i = i || 0];
        values[index] = i < compactSubstitution.length - 2 ?
          I.substitute(compactSubstitution, value.$select(index), i + 1) :
          compactSubstitution[i + 1];
        return value.$update(values);
      }
      if (I.isTable(compactSubstitution)) {
        const values = I.createTable();
        for (let index in compactSubstitution) {
          values[index] = I.substitute(compactSubstitution[index], value.$select(index));
        }
        return value.$update(values);
      }
    }
  });
  I.setup({
    //@{Std.Data.Difference} bottom difference for value absence
    Bottom: () => I.$.create(),
    //@{Std.Data.Difference} zero difference for equal values
    Zero: () => I.$.create([])
  });
})