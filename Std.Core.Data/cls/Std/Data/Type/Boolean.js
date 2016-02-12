//@ A boolean type describes true and false.
'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function (value) {
      return value === false || value === true;
    },
    marshalValue: I.returnArgument,
    unmarshalJSON: I.returnArgument
  });
})