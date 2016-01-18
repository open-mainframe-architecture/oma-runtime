'Any'.subclass(function (I) {
  "use strict";
  // I describe an immutable list, dictionary or record value.
  I.know({
    // data type classifies this composed value as a member of list, dictionary or record type
    $type: null,
    // type expression restricts type of this value
    $expr: null,
    // frozen array or table with child values
    _: null,
    // get child at index
    $at: function (index) {
      return I.isPropertyOwner(this._, index) ? this._[index] : this.$bad(index);
    },
    // abort with error
    $bad: function () {
      throw I._.Failure.create(this, I.slice(arguments));
    },
    // enumerate children
    $each: I.returnTrue,
    // test deep equality with other value of same type and expression
    $equals: I.returnFalse
  });
})