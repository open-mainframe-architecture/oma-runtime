'AbstractType'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    mandatoryType: null
  });
  I.know({
    build: function(typespace, expression, type) {
      I.$super.build.call(this, typespace, expression);
      this.mandatoryType = type;
    },
    asMandatory: function() {
      return this.mandatoryType;
    },
    describesValue: function(value) {
      return value === null || this.mandatoryType.describesValue(value);
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: function(json, expression) {
      if (json === null) {
        return null;
      } else {
        return this.mandatoryType.unmarshalJSON(json, expression.asMandatory());
      }
    }
  });
  I.share({
    normalize: function(typespace, expression, type) {
      var nullable = I.$.describes(type) || I._.None.describes(type);
      return nullable ? type : I.$.create(typespace, expression, type);
    }
  });
})