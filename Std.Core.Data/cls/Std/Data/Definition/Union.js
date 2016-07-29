//@ A union type expression.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.have({
    //@{[Std.Data.Definition.Expression]} expressions of union alternatives
    alternativeExpressions: null
  });
  I.know({
    //@param source {string} source text
    //@param alternatives {[Std.Data.Definition.Expression]} alternative expressions
    build: function(source, alternatives) {
      I.$super.build.call(this, source);
      this.alternativeExpressions = alternatives;
    },
    popEvaluation: function(evaluation, alternativeTypes) {
      return Type._.Union._.normalize(evaluation.typespace, this, alternativeTypes);
    },
    pushEvaluation: function(evaluation) {
      evaluation.pushExpressions(this.alternativeExpressions);
    },
    substitute: function(variables) {
      const alternatives = this.alternativeExpressions;
      const subs = I.substituteExpressions(alternatives, variables);
      return subs === alternatives ? this : I.Data.TypeDefinitionLanguage.createUnion(subs);
    }
  });
})