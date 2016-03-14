//@ An AST for addition evaluates a record type.
'Expression'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.Definition.Expression]} cascaded subexpressions
    cascadedExpressions: null
  });
  I.know({
    //@param source {string} normalized source of expression
    //@param cascade {[Std.Data.Definition.Expression]} subexpressions to add
    build: function(source, cascade) {
      I.$super.build.call(this, source);
      this.cascadedExpressions = cascade;
    },
    //@except when one of the subexpressions does not evaluate to a record type
    popEvaluation: function(evaluation, recordTypes, preliminary) {
      recordTypes.forEach(this.validateRecordType.bind(this));
      evaluation.sortCallback(recordTypes, preliminary, function() {
        // set descriptors of preliminary record type after record types of subexpressions
        preliminary.setDescriptors(I._.Type._.Record._.merge(recordTypes));
      });
    },
    //@return {Std.Data.Type.Record} preliminary record type
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.cascadedExpressions);
      return I._.Type._.Record.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      var cascade = this.cascadedExpressions;
      var subs = I.substituteExpressions(cascade, variables_);
      return subs === cascade ? this : I.AST.createAddition(subs);
    },
    //@ Validate type to add.
    //@param recordType {Std.Data.AbstractType} type to validate
    //@param i {integer} position of type in expression cascade
    //@return nothing
    //@except when one of given types is not a record type
    validateRecordType: function(recordType, i) {
      if (!I._.Type._.Record.describes(recordType)) {
        this.bad(this.cascadedExpressions[i].unparse());
      }
    }
  });
})