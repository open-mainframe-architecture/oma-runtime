'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function (value) {
      return typeof value === 'string';
    },
    marshalValue: I.returnArgument,
    unmarshalJSON: I.returnArgument
  });
})