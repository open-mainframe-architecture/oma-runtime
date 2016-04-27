//@ A list type describes list values.
'Collection'.subclass(I => {
  "use strict";
  const Value = I._.Value;
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      if (Value._.List.describes(value) && value.$type.typespace === this.typespace) {
        const elementType = this.elementType;
        return value._.every(element => elementType.describeValue(element));
      }
      return false;
    },
    marshalValue: function(value, expression) {
      const typespace = this.typespace, elementExpression = this.elementExpression;
      const array = value._.map(element => typespace.marshal(element, elementExpression));
      return expression === value.$expr ? array : { _: array, $: value.$expr.unparse() };
    },
    unmarshalJSON: function(json, expression) {
      const typespace = this.typespace, elementExpression = this.elementExpression;
      const array = (json._ || json).map(it => typespace.unmarshal(it, elementExpression));
      return this.createValue(expression, array);
    },
    createPrototype: function() {
      return Object.create(I._.Value._.List.getPrototype());
    }
  });
})