'Void'.subclass(function(I, We) {
  "use strict";
  // I describe pure data containers. Unlike JavaScript objects, the containers are methodless.
  // A name with a trailing underscore, e.g. hello_, world_ or just _, represents a table.
  I.am({
  	Abstract: false,
  	Final: true
  });
  We.know({
    createConstructor: function() {
      return function Table() {};
    }
  });
})