function refine(I) {
  "use strict";
  const NAME = /^[A-Z][0-9A-Za-z]+(?:\.[A-Z][0-9A-Za-z]+)*$/;
  I.know({
    //@ Add type definitions from module configuration.
    //@param definitions_ {Std.Table} map type names to type definitions
    //@return nothing
    defineTypes: function(definitions_) {
      for (let name in definitions_) {
        this.assert(NAME.test(name));
        const source = definitions_[name];
        this.defineType(name, typeof source === 'string' ? source : record(source));
      }
    }
  });
  // compute source of record type from module configuration
  function record(fields_) {
    const accu = [];
    if (fields_.$macro) {
      accu.push('(');
      fields_.$macro.forEach((formal, i) => {
        accu.push(i ? ',' : '', formal);
      });
      accu.push(')');
    }
    if (fields_.$super) {
      accu.push(fields_.$super, '+');
    }
    accu.push('{');
    let comma = '';
    for (let key in fields_) {
      if (key.charAt(0) !== '$') {
        const source = fields_[key];
        accu.push(comma, key, ':', typeof source === 'string' ? source : record(source));
        comma = ',';
      }
    }
    accu.push('}');
    return accu.join('');
  }
}