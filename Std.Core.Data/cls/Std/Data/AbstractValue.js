'Void'.subclass(function (I) {
  "use strict";
  // I describe an immutable list, dictionary and record value.
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
      throw I._.Failure.create(this, I._.slice(arguments));
    },
    // enumerate children
    $each: burdenSubclass,
    // test deep equality with other value of same type and expression
    $equals: burdenSubclass
  });
  I.share({
    burdenSubclass: burdenSubclass
  });
  function burdenSubclass() { //jshint validthis:true
    this.$bad('abstraction');
  }
})