//@ Manage damage of exceptions on stage.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: true
  });
  I.know({
    //@ If possible, repair consequences of an exception on stage.
    //@param manager {Std.Theater.Agent} manager delegating damage repair
    //@param job {Std.Theater.Job} job that caused exception on stage
    //@param exception {Std.Failure|Std.Runtime.Exception} stage exception
    //@return {any} result for job
    repair: I.burdenSubclass
  });
  I.nest({
    //@ Lethal damage cannot be repaired.
    Lethal: 'Damage'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      I.know({
        repair: function(manager, job, exception) {
          job.getActor().bury();
          return exception;
        }
      });
    }),
    //@ Minimal damage only causes the job to fail.
    Minimal: 'Damage'.subclass(function(I) {
      I.am({
        Abstract: false
      });
      I.know({
        repair: function(manager, job, exception) {
          job.getActor().resume();
          return exception;
        }
      });
    }),
  });
  I.setup({
    //@ Always return lethal damage that kills the failing actor.
    //@return {Std.Management.Damage} lethal damage
    returnLethal: function() { return I.returnWith(I.Lethal.create()); },
    //@ Always return minimal damage that resumes the failing actor.
    //@return {Std.Management.Damage} minimal damage
    returnMinimal: function() { return I.returnWith(I.Minimal.create()); }
  });
})