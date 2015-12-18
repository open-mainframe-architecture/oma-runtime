'AbstractType'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function (value) {
      return typeof value === 'number' && ~~value === value;
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: I.returnArgument
  });
})