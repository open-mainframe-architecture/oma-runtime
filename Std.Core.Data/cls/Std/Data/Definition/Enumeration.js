//@ An AST for an enumeration type.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.have({
    //@{[string]} string choices (without quotes)
    enumerationChoices: null
  });
  I.know({
    //@param source {string} normalized source of enumeration
    //@param choices {[string]} choices of enumeration
    build: function(source, choices) {
      I.$super.build.call(this, source);
      this.enumerationChoices = choices;
    },
    pushEvaluation: function(evaluation) {
      return Type._.Enumeration.create(evaluation.typespace, this, this.enumerationChoices);
    }
  });
})