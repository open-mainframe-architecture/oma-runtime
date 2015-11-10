'Role'.subclass(function(I) {
  "use strict";
  I.play({
    kill: function() {
      var teamWalk = this.$agent.walkTeam();
      if (teamWalk.has()) {
        var killed = [].accu(I.Loop.collect(teamWalk, function(agent) {
          return agent.kill().completes();
        }));
        // kill this manager again after team members have been killed
        return I.When.all(killed).yields(this.$agent.kill());
      }
      // proceed with suicide of this manager when team is empty
      return I.$superRole.kill.call(this);
    },
    // default handling of exception on stage is strict
    manageException: function(job, exception) {
      // bury actor that caused exception on stage, because the role may be inconsistent
      job.getActor().bury();
      return exception;
    },
    // complete job with failure when actor has died
    managePostMortem: function(job) {
      return I._.Failure.create(job.getActor(), ['death']);
    },
    // bury actor that died on stage
    manageSuicide: function(job) {
      job.getActor().bury();
      // true to confirm the actor has been killed
      return true;
    }
  });
})