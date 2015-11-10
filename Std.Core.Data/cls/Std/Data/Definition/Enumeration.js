'Expression'.subclass(function(I) {
  "use strict";
  // I describe ASTs for enumeration types.
  I.am({
    Abstract: false
  });
  I.have({
    enumerationChoices: null
  });
  I.know({
    build: function(source, choices) {
      I.$super.build.call(this, source);
      this.enumerationChoices = choices;
    },
    pushEvaluation: function(evaluator) {
      return I._.Type._.Enumeration.create(evaluator.typespace, this, this.enumerationChoices);
    }
  });
})