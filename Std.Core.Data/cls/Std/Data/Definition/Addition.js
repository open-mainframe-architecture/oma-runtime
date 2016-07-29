//@ A record type addition.
'Expression'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.Definition.Expression]} cascaded subexpressions
    cascadedExpressions: null
  });
  const Type = I._.Type;
  I.know({
    //@param source {string} normalized source of expression
    //@param cascade {[Std.Data.Definition.Expression]} subexpressions to add
    build: function(source, cascade) {
      I.$super.build.call(this, source);
      this.cascadedExpressions = cascade;
    },
    //@except when one of the subexpressions does not evaluate to a record type
    popEvaluation: function(evaluation, recordTypes, preliminary) {
      if (!recordTypes.every(type => type.isRecord())) {
        I.fail(`bad type addition ${this.unparse()}`);
      }
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
    substitute: function(variables) {
      const cascade = this.cascadedExpressions;
      const subs = I.substituteExpressions(cascade, variables);
      return subs === cascade ? this : I.Data.TypeDefinitionLanguage.createAddition(subs);
    }
  });
})