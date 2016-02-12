//@ An AST for an enumeration type.
'Expression'.subclass(function (I) {
  "use strict";
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
    build: function (source, choices) {
      I.$super.build.call(this, source);
      this.enumerationChoices = choices;
    },
    pushEvaluation: function (evaluator) {
      return I._.Type._.Enumeration.create(evaluator.typespace, this, this.enumerationChoices);
    }
  });
})