//@ An enumeration type describes string choices.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Set[string]} set with choices
    enumeratedChoices: null
  });
  I.know({
    //@param typespace {Std.Data.Typespace} typespace of this enumeration type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param choices {Set[string]} string choices
    build: function(typespace, expression, choices) {
      I.$super.build.call(this, typespace, expression);
      this.enumeratedChoices = choices;
    },
    isEnumeration: I.returnTrue,
    marshalValue: I.shouldNotOccur,
    testMembership: function(value) {
      return this.enumeratedChoices.has(value);
    },
    unmarshalJSON: I.returnArgument
  });
  I.share({
    //@ Merge choices of enumeration types.
    //@param typespace {Std.Data.Typespace} typespace of new enumeration type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param enumerations {[Std.Data.Type.Enumeration]} enumeration types
    //@return {Std.Data.Type.Enumeration} merged enumeration type
    merge: (typespace, expression, enumerations) => {
      if (enumerations.length === 1) {
        return enumerations[0];
      }
      const choices = new Set(), add = choices.add;
      enumerations.forEach(enumeration => {
        enumeration.enumeratedChoices.forEach(add, choices);
      });
      return I.$.create(typespace, expression, choices);
    }
  });
})