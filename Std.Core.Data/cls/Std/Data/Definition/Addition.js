'Expression'.subclass(function (I) {
  "use strict";
  // I describe ASTs for addition of record types.
  I.am({
    Abstract: false
  });
  I.have({
    cascadedExpressions: null
  });
  I.know({
    build: function (source, cascade) {
      I.$super.build.call(this, source);
      this.cascadedExpressions = cascade;
    },
    popEvaluation: function (evaluator, recordTypes, preliminary) {
      for (var i = 0, n = recordTypes.length; i < n; ++i) {
        var recordType = recordTypes[i];
        if (!I._.Type._.Record.describes(recordType)) {
          this.bad('record', this.cascadedExpressions[i].unparse());
        }
      }
      evaluator.sortCallback(recordTypes, preliminary, function () {
        // set descriptors of record type when all dependencies have been evaluated
        preliminary.setDescriptors(I._.Type._.Record._.merge(recordTypes));
      });
    },
    pushEvaluation: function (evaluator) {
      evaluator.pushExpressions(this.cascadedExpressions);
      return I._.Type._.Record.create(evaluator.typespace, this);
    },
    substitute: function (variables_) {
      var cascade = this.cascadedExpressions;
      var subs = I.substituteExpressions(cascade, variables_);
      return subs === cascade ? this : I.Cache.createAddition(subs);
    }
  });
})