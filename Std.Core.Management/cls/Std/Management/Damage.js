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
    //@{Std.Closure} always return lethal damage that kills the failing actor
    returnLethal: function() { return I.returnWith(I.Lethal.create()); },
    //@{Std.Closure} always return minimal damage that resumes the failing actor
    returnMinimal: function() { return I.returnWith(I.Minimal.create()); }
  });
})