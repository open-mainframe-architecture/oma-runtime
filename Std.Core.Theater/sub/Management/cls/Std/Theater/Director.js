'BaseObject+Manager'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    manageException: I.shouldNotOccur
  });
})