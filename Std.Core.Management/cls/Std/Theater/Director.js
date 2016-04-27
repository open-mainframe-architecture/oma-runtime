//@ A director manages itself. It is the root actor in a theater.
'BaseObject+Manager'.subclass(I=> {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.know({
    assessDamage: I.shouldNotOccur
  });
})