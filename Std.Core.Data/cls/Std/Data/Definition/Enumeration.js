//@ An enumeration type expression.
'Expression'.subclass(I => {
  "use strict";
  const Type = I._.Type;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Set[string]} string choices (without quotes)
    enumeratedChoices: null
  });
  I.know({
    //@param source {string} normalized source of enumeration
    //@param choices {Set[string]} choices of enumeration
    build: function(source, choices) {
      I.$super.build.call(this, source);
      this.enumeratedChoices = choices;
    },
    pushEvaluation: function(evaluation) {
      return Type._.Enumeration.create(evaluation.typespace, this, this.enumeratedChoices);
    }
  });
})