function refine(I) {
  "use strict";
  I.know({
    //@ Add promise to a chain of promises.
    //@param onFulfillment {Std.Closure} called with intermediate success of this job
    //@param onRejection {Std.Closure} called with intermediate error/failure of this job
    //@return {Std.Theater.Job} promise to fulfill or reject with result of this job
    then: function(onFulfillment, onRejection) {
      return !onFulfillment && !onRejection ? this.running() : (() =>
        this.sceneCount < 0 ? I.promised(this.jobResult, onFulfillment, onRejection) :
          this.done(true).triggers(() => I.promised(this.jobResult, onFulfillment, onRejection))
      ).play();
    }
  });
}