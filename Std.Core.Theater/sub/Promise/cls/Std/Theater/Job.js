function refine(I) {
  "use strict";
  I.know({
    //@ Turn this job into a JavaScript promise.
    //@return {promise} promise that resolves with result or rejects with error of this job
    promised: function() {
      return new Promise((resolve, reject) => {
        const complete = () => {
          if (I.isError(this.jobResult)) {
            // reject with erroneous result
            reject(this.jobResult);
          } else {
            // resolve with successful resolt
            resolve(this.jobResult);
          }
        };
        if (this.sceneCount < 0) {
          // no need for scene on stage if job result is already available
          complete();
        } else {
          // play scene with extra actor to wait for job completion
          (() => this.done(true).triggers(complete)).play();
        }
      });
    },
    //@ Chain this job in a JavaScript promise.
    //@param onFulfillment {function} called with intermediate success of this job
    //@param onRejection {function} called with intermediate error of this job
    //@return {promise} JavaScript promise
    then: function(onFulfillment, onRejection) {
      return this.promised().then(onFulfillment, onRejection);
    }
  });
}