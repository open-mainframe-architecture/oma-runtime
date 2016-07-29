'super'.subclass({
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.know({
    //@ Create new incident.
    //@param job {Std.Theater.Job} theater job that's causing incident
    //@param exception {error?} problem of incident
    //@param json {object?} incomplete JSON representation of incident
    //@return {Std.Data.Value.Record} incident record
    createIncident: function(job, exception, json) {
      json = json || {};
      if (job) {
        json.job = job.getPurpose();
        json.role = job.getActor().getRoleClass().getName();
      }
      if (exception) {
        json.reason = exception.message;
        json.trace = exception.stack.split('\n');
      }
      json.uptime = this.$rt.uptime();
      return I.typespace$.unmarshal(json, 'Incident');
    }
  });
})