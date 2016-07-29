//@ A string type describes string values.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    isString: I.returnTrue,
    marshalValue: I.returnArgument,
    testMembership: I.isString,
    unmarshalJSON: I.returnArgument
  });
})