'super'.subclass({
  data$: 'Std.Data',
  system$: 'Std.Runtime.System'
}, I => {
  "use strict";
  I.know({
    //@ Warn about an incident.
    //@param incident {Std.Data.Value.Record} incident record
    //@return nothing
    warn: function(incident) {
      // delegate incident warning to runtime system (which might ignore it)
      this.$rt.warn(incident);
    },
    //@ Warn about a stage problem.
    //@param job {Std.Theater.Job} job that failed on stage
    //@param exception {Std.Failure|Std.Runtime.Exception} problem caused by actor
    //@param damage {Std.Management.Damage} damage assessment
    //@return nothing
    warnDamage: function(job, exception, damage) {
      this.warn(I.createIncident(job, exception, { damage: damage.$.getName() }));
    },
    //@ Warn about a zombie problem when dead actor wants to work on stage.
    //@param job {Std.Theater.Job} job for dead actor
    //@return nothing
    warnZombie: function(job) {
      this.warn(I.createIncident(job, null, { reason: 'zombie' }));
    }
  });
  I.share({
    //@ Create new incident.
    //@param job {Std.Theater.Job} theater job that's causing incident
    //@param exception {Std.Failure|Std.Runtime.Exception} problem of incident
    //@param json {Object?} incomplete JSON representation of incident
    //@return {Std.Data.Value.Record} incident record
    createIncident: function(job, exception, json) {
      json = json || {};
      if (job) {
        json.job = job.getPurpose();
        json.role = job.getActor().getRoleClass().getName();
      }
      if (exception) {
        const failure = I.failHere(null, exception);
        json.reason = failure.reason;
        json.trace = failure.trace;
      }
      json.uptime = I.system$.getUptime();
      return I.data$.unmarshal(json, 'Incident');
    }
  });
})