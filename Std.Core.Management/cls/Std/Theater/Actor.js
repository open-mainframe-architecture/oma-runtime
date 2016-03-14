function refine(I) {
  "use strict";
  I.refine({
    isManaging: function() {
      return this.getRoleClass().isMixedBy(I._.Manager);
    },
    managePostMortem: function(job) {
      // manage performance for this dead actor
      return this.actorManager.managePostMortem(job.forkScene());
    },
    manageStageException: function(job, exception) {
      if (exception === I.PoisonPill) {
        // manage poison pill as suicide attempt on stage
        return this.actorManager.manageSuicide(job.forkScene());
      } else {
        // delegate exception handling to manager
        return this.actorManager.manageException(job.forkScene(), exception);
      }
    }
  });
  I.share({
    //@{Object} actor throws poison pill on stage to commit suicide
    PoisonPill: Object.freeze({})
  });
}