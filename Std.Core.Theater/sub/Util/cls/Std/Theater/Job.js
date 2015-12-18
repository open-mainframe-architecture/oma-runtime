function refine(I) {
  "use strict";
  I.know({
    done: function (onFulfillment, onRejection) {
      this.then(onFulfillment, onRejection).run();
    },
    then: function (onFulfillment, onRejection) {
      if (onFulfillment || onRejection) {
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
      // this job already represents the promise if there's nothing to fulfill or reject
      return this;
    },
    trap: function (errorClass, onRejection) {
      var errorHandler = onRejection || typeof errorClass === 'function' && errorClass;
      return !onRejection && errorHandler ? this.then(null, errorHandler) :
        this.then(null, function (error) {
          if (!errorClass.describes(error)) {
            // pass on unmatched error
            return error;
          } else if (errorHandler) {
            // handle matched error
            return errorHandler(error);
          }
          // else ignore matched error
        });
    }
  });
}