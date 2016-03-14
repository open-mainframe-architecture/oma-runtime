//@ A number type describes finite numbers, excluding NaN and Infinity.
'AbstractType'.subclass(function(I) {
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