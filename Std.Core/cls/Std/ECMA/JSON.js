'ECMA.Object'.subclass((I, We) => {
  "use strict";
  We.know({
    //@ Parse JSON value from its string representation.
    //@param text {string} source text to parse
    //@param reviver {function?} optional reviver for parse results of child values
    //@return {*} JSON null, boolean, number, string, array or object
    parse: JSON.parse,
    //@ Convert JSON value to its string representation.
    //@param value {string} JSON value to convert
    //@param replacer {function?} optional replacer for unparse results of child values
    //@param space {string|number?} optional space for separation
    //@return {string} string representation
    stringify: JSON.stringify
  });
})