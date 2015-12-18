'Void'.subclass(Object, function (I) {
  "use strict";
  // I am the class of plain old JavaScript objects, e.g. {hello: 'world'}.
  I.am({
    Abstract: false
  });
})