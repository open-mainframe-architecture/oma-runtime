'Collection'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      if (I._.Value._.Dictionary.describes(value) && value.$type.typespace === this.typespace) {
        var table = value._;
        var elementType = this.elementType;
        for (var key in table) {
          if (!elementType.describesValue(table[key])) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    marshalValue: function(value, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      var nested = {}, values_ = value._;
      for (var key in values_) {
        nested[key] = typespace.marshal(values_[key], elementExpression);
      }
      return expression === value.$expr ? {_: nested} : {_: nested, $: value.$expr.unparse()};
    },
    unmarshalJSON: function(json, expression) {
      var typespace = this.typespace, elementExpression = this.elementExpression;
      var values_ = I.createTable(), nested = json._;
      for (var key in nested) {
        values_[key] = typespace.unmarshal(nested[key], elementExpression);
      }
      return this.createValue(expression, values_);
    },
    createPrototype: function() {
      return Object.create(I._.Value._.Dictionary.getPrototype());
    }
  });
})