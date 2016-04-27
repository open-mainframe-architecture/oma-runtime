//@ An enumeration type describes string choices.
'AbstractType'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} map choice to true
    enumeratedChoices_: null
  });
  I.know({
    //@param typespace {Std.Data.Typespace} typespace of this enumeration type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param choices {[string]} string choices
    build: function(typespace, expression, choices) {
      I.$super.build.call(this, typespace, expression);
      const choices_ = this.enumeratedChoices_ = I.createTable();
      for (let choice of choices) {
        choices_[choice] = true;
      }
    },
    describesValue: function(value) {
      return typeof value === 'string' && !!this.enumeratedChoices_[value];
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: I.returnArgument
  });
  I.share({
    //@ Merge choices of enumeration types.
    //@param typespace {Std.Data.Typespace} typespace of new enumeration type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param enumerations {[Std.Data.Type.Enumeration]} enumeration types
    //@return {Std.Data.Type.Enumeration} merged enumeration type
    merge: function(typespace, expression, enumerations) {
      if (enumerations.length === 1) {
        return enumerations[0];
      }
      const choices_ = I.createTable();
      for (let enumeration of enumerations) {
        Object.assign(choices_, enumeration.enumeratedChoices_);
      }
      return I.$.create(typespace, expression, Object.getOwnPropertyNames(choices_));
    }
  });
})