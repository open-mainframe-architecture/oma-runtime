//@ A parser processes source texts.
'Trait'.subclass(I => {
  "use strict";
  I.know({
    //@ Parse source text.
    //@param source {string} source text
    //@return {any} parse result, e.g. an AST
    //@except when there are parse errors
    parse: I.burdenSubclass
  });
})