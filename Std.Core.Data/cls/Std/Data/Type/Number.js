'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: I.isFiniteNumber,
    marshalValue: I.returnArgument,
    unmarshalJSON: I.returnArgument
  });
})