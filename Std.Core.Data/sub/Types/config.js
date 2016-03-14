function configure(module) {
  "use strict";
  module.description = 'This module defines the standard datatypes.';
  module.datatypes = {
    // any value, including null
    Any: '*?',
    // a flag is an efficient boolean type for record fields
    Flag: '"y"?',
    // a line or lines of text
    Text: 'string|[string]',
    // linear sequence of values
    List: '(T=Any)[T]',
    // string mapping to values
    Dict: '(T=Any)<T>',
    // an optional value may be null
    Maybe: '(T=*)T?',
    // any record value
    Record: '{}'
  };
}