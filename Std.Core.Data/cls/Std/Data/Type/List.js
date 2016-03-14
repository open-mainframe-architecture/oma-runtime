//@ A list type describes list values.
'Collection'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      if (I._.Value._.List.describes(value) && value.$type.typespace === this.typespace) {
        var elementType = this.elementType;
        return value._.every(function(element) { return elementType.describeValue(element); });
      }
      return false;
    },
    marshalValue: function(value, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      var array = value._.map(function(element) {
        return typespace.marshal(element, elementExpression);
      });
      return expression === value.$expr ? array : { _: array, $: value.$expr.unparse() };
    },
    unmarshalJSON: function(json, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      return this.createValue(expression, (json._ || json).map(function(jsonElement) {
        return typespace.unmarshal(jsonElement, elementExpression);
      }));
    },
    createPrototype: function() {
      return Object.create(I._.Value._.List.getPrototype());
    }
  });
})