'AbstractType'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      return I.isBasicValue(value) ||
        I.isComposedValue(value) && value.$type.typespace === this.typespace;
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: function(json, expression) {
      if (I.isBasicValue(json)) {
        return json;
      } else if (json) {
        var typespace = this.typespace;
        if (Array.isArray(json._ || json)) {
          // list with values
          return typespace.unmarshal(json, '[*?]');
        } else if (json._) {
          // dictionary with entries
          return typespace.unmarshal(json, '<*?>');
        } else {
          // empty record
          return typespace.unmarshal(json, '{}');
        }
      } else {
        this.bad(json);
      }
    }
  });
})