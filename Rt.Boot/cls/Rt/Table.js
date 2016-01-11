'Void'.subclass(function (I, We) {
  "use strict";
  // I describe a pure data container. Unlike a JavaScript object, a table is methodless.
  // A name with a trailing underscore, e.g. hello_, world_ or just _, represents a table.
  I.am({
    Abstract: false,
    Final: true
  });
  We.know({
    createConstructor: function () {
      return function Table() { };
    }
  });
})