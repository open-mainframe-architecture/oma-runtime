//@ A manager decides over life and death of managed actors.
'Role'.subclass(function(I) {
  "use strict";
  I.know({
    //@ Determine consequences of an exception on stage.
    //@param job {Std.Theater.Job} job that caused exception
    //@param exception {Std.Runtime.Exception|Std.Failure} exception or failure
    //@return {Std.Management.Damage} damage assessment
    assessDamage: I.burdenSubclass,
    //@ Create incident object that can be serialized.
    //@param job {Std.Theater.Job} job that failed on stage
    //@param exception {Std.Failure|Std.Runtime.Exception} problem caused by actor
    //@param incident {Std.Management.Damage} damage assessment
    //@return {Object} incident object
    createIncident: function(job, exception, damage) {
      var incident = I.failWith(job.getAgent(), exception).createPortrait();
      incident.job = job.getPurpose();
      incident.role = job.getActor().getRoleClass().getName();
      incident.damage = damage.$.getName();
      incident.uptime = this.$rt.getUptime();
      return incident;
    },
    //@ Report stage problem.
    //@param job {Std.Theater.Job} job that failed on stage
    //@param exception {Std.Failure|Std.Runtime.Exception} problem caused by actor
    //@param incident {Std.Management.Damage} damage assessment
    //@return nothing
    reportProblem: function(job, exception, damage) {
      this.$rt.warn(this.createIncident(job, exception, damage));
    }
  });
  I.play({
    kill: function() {
      var teamWalk = this.$agent.walkTeam();
      if (teamWalk.has()) {
        var jobs = [].accumulate(I.Loop.collect(teamWalk, function(member) {
          return member.kill();
        }));
        // kill this manager again after team members have been killed
        return I.When.every(jobs.map(I.When.complete)).triggers(this.$agent.kill());
      }
      // proceed with suicide of this manager when team is empty
      return I.$superRole.kill.call(this);
    },
    //@ Handle exception of actor that was playing on stage.
    //@param job {Std.Theater.Job} job clone explains what actor was doing
    //@param exception {Std.Failure|Std.Runtime.Exception} problem caused by actor
    //@return {any} result of failed job
    manageException: function(job, exception) {
      var damage = this.assessDamage(job, exception);
      this.reportProblem(job, exception, damage);
      return damage.repair(this.$agent, job, exception);
    },
    //@ Complete job of dead actor.
    //@param job {Std.Theater.Job} job sent to dead actor
    //@return {Std.Failure} unsuccessful result of job
    managePostMortem: function(job) {
      return I._.Failure.create(job.getActor(), 'death');
    },
    //@ Handle suicide attempt of actor on stage.
    //@param job {Std.Theater.Job} job of suicidal actor
    //@return {boolean} true if actor was killed, otherwise false
    manageSuicide: function(job) {
      // bury actor that died on stage
      job.getActor().bury();
      // true to confirm the actor has been killed
      return true;
    }
  });
})