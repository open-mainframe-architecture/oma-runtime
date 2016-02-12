//@ A manager decides over life and death of managed actors.
'Role'.subclass(function (I) {
  "use strict";
  I.play({
    kill: function () {
      var teamWalk = this.$agent.walkTeam();
      if (teamWalk.has()) {
        var killed = [].accumulate(I.Loop.collect(teamWalk, function (agent) {
          return agent.kill().completion();
        }));
        // kill this manager again after team members have been killed
        return I.When.all(killed).triggers(this.$agent.kill());
      }
      // proceed with suicide of this manager when team is empty
      return I.$superRole.kill.call(this);
    },
    //@ Handle exception of actor that was playing on stage.
    //@param job {Std.Theater.Job} job clone explains what actor was doing
    //@param exception {Std.Failure|Rt.Exception} problem caused by actor
    //@return {any} result of failed job
    manageException: function (job, exception) {
      // bury actor that caused exception on stage, because the role may be inconsistent
      job.getActor().bury();
      return exception;
    },
    //@ Complete job of dead actor.
    //@param job {Std.Theater.Job} job sent to dead actor
    //@return {Std.Failure} unsuccessful result of job
    managePostMortem: function (job) {
      return I._.Failure.create(job.getActor(), ['death']);
    },
    //@ Handle suicide attempt of actor on stage.
    //@param job {Std.Theater.Job} job of suicidal actor
    //@return {boolean} true if actor was killed, otherwise false
    manageSuicide: function (job) {
      // bury actor that died on stage
      job.getActor().bury();
      // true to confirm the actor has been killed
      return true;
    }
  });
})