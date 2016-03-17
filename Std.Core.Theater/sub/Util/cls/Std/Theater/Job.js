function refine(I) {
  "use strict";
  I.know({
    //@ Add promise to a chain of promises.
    //@param onFulfillment {Std.Closure} called with intermediate success of this job
    //@param onRejection {Std.Closure} called with intermediate error/failure of this job
    //@return {Std.Theater.Job} promise to fulfill or reject with result of this job
    then: function(onFulfillment, onRejection) {
      var job = this;
      return !onFulfillment && !onRejection ? job.running() :
        // create a promise to resolve/reject this job
        function() {
          // this code executes on stage, with receiver bound to some actor role
          return job.isDone() ? I.promised(job.jobResult, onFulfillment, onRejection) :
            job.completion(true).triggers(function() {
              return I.promised(job.jobResult, onFulfillment, onRejection);
            });
        }.play();
    }
  });
}