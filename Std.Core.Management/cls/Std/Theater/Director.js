//@ A director manages itself. It is the root agent in a theater.
'Role'.subclass(I=> {
  "use strict";
  I.know({
    //TODO abort with a bang?
    repairDamage: I.shouldNotOccur
  });
})