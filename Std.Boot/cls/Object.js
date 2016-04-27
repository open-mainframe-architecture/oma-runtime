//@ I am the class of plain old JavaScript objects.
'Any'.subclass(Object, I => {
  "use strict";
  I.am({
    Abstract: false
  });
})