function refine(I) {
  "use strict";
  const Manager = I._.Manager;
  I.refine({
    isManaging: function() {
      return this.getRoleClass().isMixedBy(Manager);
    },
    managePostMortem: function(job) {
      // manage performance for this dead actor
      return this.actorManager.managePostMortem(job);
    },
    manageStageException: function(job, exception) {
      // manage poison pill as suicide attempt on stage
      return exception === I.PoisonPill ? this.actorManager.manageSuicide(job) :
        // delegate exception handling to manager
        this.actorManager.manageException(job, exception);
    }
  });
  I.share({
    //@{Symbol} actor throws unique poison pill on stage to commit suicide
    PoisonPill: Symbol()
  });
}