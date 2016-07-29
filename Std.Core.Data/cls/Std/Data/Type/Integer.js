//@ An integer type describes integer numbers.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    isInteger: I.returnTrue,
    marshalValue: I.shouldNotOccur,
    testMembership: function(value) {
      return typeof value === 'number' && ~~value === value;
    },
    unmarshalJSON: I.returnArgument
  });
})