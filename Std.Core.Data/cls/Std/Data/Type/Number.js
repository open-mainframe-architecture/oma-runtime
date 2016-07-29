//@ A number type describes finite numbers, excluding NaN and Infinity.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    isNumber: I.returnTrue,
    marshalValue: I.returnArgument,
    testMembership: I.isFiniteNumber,
    unmarshalJSON: I.returnArgument
  });
})