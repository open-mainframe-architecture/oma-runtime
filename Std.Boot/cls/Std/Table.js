//@ A table is a methodless container.
'Void'.subclass((I, We) => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  We.know({
    createConstructor: function() {
      // descriptive constructor name unless minified
      return function Table() { };
    }
  });
})