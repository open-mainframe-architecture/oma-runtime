//@ I am the class of plain old JavaScript objects, e.g. {hello: 'world'}.
'Any'.subclass(Object, function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
})