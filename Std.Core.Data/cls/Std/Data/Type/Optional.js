//@ An optional type describes null and values of the mandatory type.
'AbstractType'.subclass(I => {
  "use strict";
  const None = I._.None;
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Data.AbstractType} mandatory type
    mandatoryType: null
  });
  I.know({
    //@param typespace {Std.Data.Typespace} typespace of this optional type
    //@param expression {Std.Data.Definition.Expression} type expression
    //@param type {Std.Data.AbstractType} mandatory type
    build: function(typespace, expression, type) {
      I.$super.build.call(this, typespace, expression);
      this.mandatoryType = type;
    },
    //@return mandatory type
    asMandatory: function() {
      return this.mandatoryType;
    },
    describesValue: function(value) {
      return value === null || this.mandatoryType.describesValue(value);
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: function(json, expression) {
      return json === null ? null :
        this.mandatoryType.unmarshalJSON(json, expression.asMandatory());
    }
  });
  I.share({
    //@ Create optional type if given type is mandatory. Otherwise return given type.
    //@param typespace {Std.Data.Typespace} typespace of new type
    //@param expression {Std.Data.Definition.Expression} expression of new type
    //@param type {Std.Data.AbstractType} candidate mandatory type
    //@return {Std.Data.Type.Optional|Std.Data.Type.None} optional or none type
    normalize: function(typespace, expression, type) {
      return I.$.describes(type) || None.describes(type) ? type :
        I.$.create(typespace, expression, type);
    }
  });
})