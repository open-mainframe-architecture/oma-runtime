function refine(I) {
  "use strict";
  I.know({
    done: function(onFulfillment, onRejection) {
      this.then(onFulfillment, onRejection).run();
    },
    then: function(onFulfillment, onRejection) {
      if (onFulfillment || onRejection) {
        // create a lazy promise to resolve this job
        var self = this;
        // beware that top-level function asPromised() is illegal in strict mode
        var asPromised = function() {
          return I.promised(self.jobResult, onFulfillment, onRejection);
        };
        return function() {
          return self.hasResult() ? asPromised() : self.completes(asPromised);
        }.play(true);
      } else {
        return this;
      }
    },
    trap: function(errorClass, onRejection) {
      var errorHandler = onRejection || typeof errorClass === 'function' && errorClass;
      return !onRejection && errorHandler ? this.then(null, errorHandler) :
        this.then(null, function(error) {
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