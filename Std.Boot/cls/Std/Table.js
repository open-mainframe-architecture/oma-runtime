//@ A table is a methodless container. Table names have trailing underscores, e.g. storage_ or _.
'Any'.subclass((I, We) => {
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