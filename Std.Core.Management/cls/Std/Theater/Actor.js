function refine(I) {
  "use strict";
  I.refine({
    managePostMortem: function(job) {
      // manage performance for this dead actor
      return this.$supervisor.$agent.managePostMortem(job);
    },
    manageStageException: function(job, exception) {
      const manager = this.$supervisor.$agent;
      // manage poison pill as suicide attempt on stage
      return exception === I.PoisonPill ? manager.manageSuicide(job) :
        // delegate exception handling to manager
        manager.manageException(job, I.threw(exception));
    }
  });
  I.share({
    //@{symbol} actor throws unique poison pill on stage to commit suicide
    PoisonPill: Symbol('poison pill')
  });
}