//@ A none type describes null values.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    asMandatory: I.shouldNotOccur,
    isNone: I.returnTrue,
    marshalValue: I.returnArgument,
    testMembership: function(value) {
      return value === null;
    },
    unmarshalJSON: I.returnArgument
  });
})