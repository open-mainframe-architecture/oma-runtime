//@ A wildcard type describes all data values except null.
'AbstractType'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    describesValue: function(value) {
      return I.Data.isBasicValue(value) ||
        I.Data.isComposedValue(value) && value.$type.typespace === this.typespace;
    },
    marshalValue: I.shouldNotOccur,
    unmarshalJSON: function(json, expression) {
      if (I.Data.isBasicValue(json)) {
        return json;
      } else if (json) {
        var typespace = this.typespace;
        // list with values
        return Array.isArray(json._ || json) ? typespace.unmarshal(json, '[*?]') :
          // dictionary with entries
          json._ ? typespace.unmarshal(json, '<*?>') :
            // empty record
            typespace.unmarshal(json, '{}');
      } else {
        this.bad();
      }
    }
  });
})