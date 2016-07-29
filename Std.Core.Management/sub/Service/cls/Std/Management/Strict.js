//@ Strict management kills actors after they cause an error.
'Role'.subclass(I => {
  "use strict";
  I.know({
    isManaging: I.returnTrue,
    repairDamage: function(job, exception) {
      job.getActor().bury();
      return exception;
    }
  });
})