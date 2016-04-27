//@ A manager decides over life and death of managed actors.
'Role'.subclass(I => {
  "use strict";
  const Failure = I._.Failure;
  I.know({
    //@ Determine consequences of an exception on stage.
    //@param job {Std.Theater.Job} job that caused exception
    //@param exception {Std.Runtime.Exception|Std.Failure} exception or failure
    //@return {Std.Management.Damage} damage assessment
    assessDamage: I.burdenSubclass
  });
  I.play({
    kill: function() {
      const teamWalk = this.$agent.walkTeam();
      if (teamWalk.has()) {
        return I.When.every([...teamWalk].map(member => member.kill().done()))
          // kill this manager again after team members have been killed
          .triggers(this.$agent.kill());
      }
      // proceed with suicide of this manager when team is empty
      return I.$superRole.kill.call(this);
    },
    //@ Handle exception of actor that was playing on stage.
    //@param job {Std.Theater.Job} job clone explains what actor was doing
    //@param exception {Std.Failure|Std.Runtime.Exception} problem caused by actor
    //@return {any} result of failed job
    manageException: function(job, exception) {
      const damage = this.assessDamage(job, exception);
      this.$theater.warnDamage(job, exception, damage);
      return damage.repair(this.$agent, job, exception);
    },
    //@ Complete job of dead actor.
    //@param job {Std.Theater.Job} job sent to dead actor
    //@return {Std.Failure} unsuccessful result of job
    managePostMortem: function(job) {
      this.$theater.warnZombie(job);
      return Failure.create(job.getActor(), 'death');
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