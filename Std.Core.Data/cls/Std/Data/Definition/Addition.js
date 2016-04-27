//@ An AST for addition evaluates a record type.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
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
      this.assert(recordTypes.every(type => Type._.Record.describes(type)));
      evaluation.sortCallback(recordTypes, preliminary, () => {
        // set descriptors of preliminary record type after record types of subexpressions
        preliminary.setDescriptors(Type._.Record._.merge(recordTypes));
      });
    },
    //@return {Std.Data.Type.Record} preliminary record type
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.cascadedExpressions);
      return Type._.Record.create(evaluation.typespace, this);
    },
    substitute: function(variables_) {
      const cascade = this.cascadedExpressions;
      const subs = I.substituteExpressions(cascade, variables_);
      return subs === cascade ? this : I.AST.createAddition(subs);
    }
  });
})