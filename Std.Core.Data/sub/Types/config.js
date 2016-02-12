function configure(module) {
  "use strict";
  module.description = 'This module defines the standard datatypes.';
  module.datatypes = {
    Any: '*?',
    Flag: '"y"?',
    Text: 'string|[string]',
    List: '(T=Any)[T]',
    Dict: '(T=Any)<T>',
    Maybe: '(T=*)T?',
    Record: '{}',
    Pixel: { height: 'integer', width: 'integer' }
  };
}