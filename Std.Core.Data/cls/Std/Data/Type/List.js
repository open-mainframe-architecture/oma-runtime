'Collection'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function (value) {
      if (I._.Value._.List.describes(value) && value.$type.typespace === this.typespace) {
        var array = value._;
        var elementType = this.elementType;
        for (var i = 0, n = array.length; i < n; ++i) {
          if (!elementType.describesValue(array[i])) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    marshalValue: function (value, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      var array = [], values = value._;
      for (var i = 0, n = values.length; i < n; ++i) {
        array[i] = typespace.marshal(values[i], elementExpression);
      }
      return expression === value.$expr ? array : { _: array, $: value.$expr.unparse() };
    },
    unmarshalJSON: function (json, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      var values = [], array = json._ || json;
      for (var i = 0, n = array.length; i < n; ++i) {
        values[i] = typespace.unmarshal(array[i], elementExpression);
      }
      return this.createValue(expression, values);
    },
    createPrototype: function () {
      return Object.create(I._.Value._.List.getPrototype());
    }
  });
})