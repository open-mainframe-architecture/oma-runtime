//@ Loose supervision allows actor to work after they cause an error.
'BaseObject+Manager'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Service: true
  });
  I.play({
    manageException: function (job, exception) {
      console.log('loose', exception);
      // assume the troubled actor is still consistent and resume it in the same state
      job.getActor().resume();
      return exception;
    }
  });
})