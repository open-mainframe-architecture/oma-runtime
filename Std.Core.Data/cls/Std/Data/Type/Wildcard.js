//@ A wildcard type describes all data values except null.
'Type.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.know({
    isWildcard: I.returnTrue,
    marshalValue: I.shouldNotOccur,
    testMembership: function(value) {
      return value === null || I.Data.isBasic(value) ||
        I.Data.isComposed(value) && value.$type.typespace === this.typespace;
    },
    unmarshalJSON: function(json, expression) {
      if (json === null || I.Data.isBasic(json)) {
        return json;
      } else {
        const typespace = this.typespace;
        // list with values
        return Array.isArray(json._ || json) ? typespace.unmarshal(json, '[*?]') :
          // dictionary with entries
          json._ ? typespace.unmarshal(json, '<*?>') :
            // useles, empty record
            typespace.unmarshal(json, '{}');
      }
    }
  });
})