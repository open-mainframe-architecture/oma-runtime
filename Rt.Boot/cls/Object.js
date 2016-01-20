//@ I am the class of plain old JavaScript objects.
'Any'.subclass(Object, function (I) {
  "use strict";
  I.am({
    //@ The creation of a JavaScript object is easy, e.g. {hello: 'world'}.
    Abstract: false
  });
})