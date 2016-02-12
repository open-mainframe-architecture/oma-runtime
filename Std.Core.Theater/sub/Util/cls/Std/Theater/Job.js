function refine(I) {
  "use strict";
  I.know({
    //@ Close a chain of promises. This is necessary to run immobile jobs.
    //@param onFulfillment {Rt.Closure} called with intermediate success of this job
    //@param onRejection {Rt.Closure} called with intermediate error/failure of this job
    //@return nothing
    done: function (onFulfillment, onRejection) {
      this.then(onFulfillment, onRejection).run();
    },
    //@ Add lazy promise to a chain of promises.
    //@param onFulfillment {Rt.Closure} called with intermediate success of this job
    //@param onRejection {Rt.Closure} called with intermediate error/failure of this job
    //@return {Std.Theater.Job} new immobile job
    then: function (onFulfillment, onRejection) {
      if (!onFulfillment && !onRejection) {
        // this job already represents the promise if there's nothing to fulfill or reject
        return this;
      }
      // create a lazy promise to resolve this job
      var self = this;
      return function () {
        // if job has result, resolve as promised
        return self.hasResult() ? I.promised(self.jobResult, onFulfillment, onRejection)
        // otherwise wait for job to complete, then resolve as promised
          : self.completion(true).triggers(function () {
            return I.promised(self.jobResult, onFulfillment, onRejection);
          });
      }.play(true);
    }
  });
}