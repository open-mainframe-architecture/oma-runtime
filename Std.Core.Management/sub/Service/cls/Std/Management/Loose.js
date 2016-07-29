//@ Loose management allows actor to work after they cause an error.
'Role'.subclass(I => {
  "use strict";
  I.know({
    isManaging: I.returnTrue,
    repairDamage: function(job, exception) {
      job.getActor().resume();
      return exception;
    }
  });
})