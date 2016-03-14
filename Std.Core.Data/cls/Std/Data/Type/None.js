//@ A none type describes null values.
'AbstractType'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      return value === null;
    },
    marshalValue: I.returnArgument,
    unmarshalJSON: I.returnArgument
  });
})