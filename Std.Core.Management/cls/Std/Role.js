'super'.subclass(['Std.Core.Theater'], {
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.know({
    //@ Try to repair the damage of a team member.
    //@param job {Std.Theater.Job} job that caused member to throw stage exception
    //@param exception {error} stage exception
    //@return {*} result of job
    //@exception when repairing is not possible
    repairDamage: I.shouldNotOccur,
    //@ Warn about an incident.
    //@param incident {Std.Data.Value.Record} incident record
    //@return nothing
    warn: function(incident) {
      // delegate warning to runtime system (which might ignore it)
      const json = I.typespace$.marshal(incident, 'Incident');
      this.$rt.warn(json);
    },
    //@ Warn about a stage problem.
    //@param job {Std.Theater.Job} job that failed on stage
    //@param exception {error} problem caused by actor
    //@return nothing
    warnProblem: function(job, exception) {
      this.warn(this.$theater.createIncident(job, exception));
    },
    //@ Warn about a zombie problem when dead actor wants to work on stage.
    //@param job {Std.Theater.Job} job for dead actor
    //@return nothing
    warnZombie: function(job) {
      this.warn(this.$theater.createIncident(job, null, { reason: 'zombie' }));
    }
  });
  I.play({
    //@ Perform death scene.
    //@promise {boolean} true if the actor is dead, otherwise false
    kill: function() {
      const actor = this.$actor;
      if (actor.isSupervisor()) {
        return I.When.every([...actor.$team].map(member => member.$agent.kill().done()))
          // kill this agent again after supervised team members have been killed
          .triggers(this.$agent.kill());
      }
      // swallow poison pill on stage to inform manager about suicide attempt of this agent
      throw I._.Theater._.Actor._.PoisonPill;
    },
    //@ Handle exception of actor that was playing on stage.
    //@param job {Std.Theater.Job} job clone explains what actor was doing
    //@param exception {error} problem caused by actor
    //@return {*} result of failed job
    manageException: function(job, exception) {
      this.warnProblem(job, exception);
      return this.repairDamage(job, exception);
    },
    //@ Complete job of dead actor.
    //@param job {Std.Theater.Job} job sent to dead actor
    //@return {error} unsuccessful result of job
    managePostMortem: function(job) {
      this.warnZombie(job);
      return new Error('death');
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
  I.share({
    //@ Propagate damage repair to manager by rethrowing exception.
    //@param job {Std.Theater.Job} offending job
    //@param exception {error} stage exception
    //@return never because it always throws exception
    propagateDamage: (job, exception) => { throw exception; },
    //@ Loose damage repair proceeds actor that caused error.
    //@param job {Std.Theater.Job} offending job
    //@param exception {error} stage exception
    //@return {error} stage exception
    repairLoose: (job, exception) => {
      job.getActor().proceed();
      return exception;
    },
    //@ Strict damage repair kills actor that caused error.
    //@param job {Std.Theater.Job} offending job
    //@param exception {error} stage exception
    //@return {error} stage exception
    repairStrict: (job, exception) => {
      job.getActor().bury();
      return exception;
    }
  });
})