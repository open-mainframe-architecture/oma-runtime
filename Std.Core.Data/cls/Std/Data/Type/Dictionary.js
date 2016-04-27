//@ A dictionary type describes dictionary values.
'Collection'.subclass(I => {
  "use strict";
  const Value = I._.Value;
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      if (Value._.Dictionary.describes(value) && value.$type.typespace === this.typespace) {
        const table = value._, elementType = this.elementType;
        for (let key in table) {
          if (!elementType.describesValue(table[key])) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    marshalValue: function(value, expression) {
      const typespace = this.typespace, elementExpression = this.elementExpression;
      const nested = {}, values_ = value._;
      for (let key in values_) {
        nested[key] = typespace.marshal(values_[key], elementExpression);
      }
      return expression === value.$expr ? { _: nested } : { _: nested, $: value.$expr.unparse() };
    },
    unmarshalJSON: function(json, expression) {
      const typespace = this.typespace, elementExpression = this.elementExpression;
      const values_ = I.createTable(), nested = json._;
      for (let key in nested) {
        values_[key] = typespace.unmarshal(nested[key], elementExpression);
      }
      return this.createValue(expression, values_);
    },
    createPrototype: function() {
      return Object.create(Value._.Dictionary.getPrototype());
    }
  });
})