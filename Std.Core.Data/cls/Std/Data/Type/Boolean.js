//@ A boolean type describes true and false.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    isBoolean: I.returnTrue,
    marshalValue: I.returnArgument,
    testMembership: I.isBoolean,
    unmarshalJSON: I.returnArgument
  });
})