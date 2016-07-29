function refine(I) {
  "use strict";
  const NamePattern = /^[A-Z][0-9A-Za-z]+(?:\.[A-Z][0-9A-Za-z]+)*$/;
  I.know({
    //@ Add type definitions from module configuration.
    //@param definitions {object|Std.Table} map type names to type definitions
    //@return nothing
    defineTypes: function(definitions) {
      for (let name in definitions) {
        if (!NamePattern.test(name)) {
          I.fail(`bad type name ${name}`);
        }
        const source = definitions[name];
        this.defineType(name, I.isString(source) ? source : record(source));
      }
    }
  });
  // compute source of record type from module configuration
  function record(fields) {
    const accu = [];
    if (fields.$macro) {
      accu.push('(');
      fields.$macro.forEach((formal, i) => {
        accu.push(i ? ',' : '', formal);
      });
      accu.push(')');
    }
    if (fields.$super) {
      accu.push(fields.$super, '+');
    }
    accu.push('{');
    let comma = '';
    for (let key in fields) {
      if (key.charAt(0) !== '$') {
        const source = fields[key];
        accu.push(comma, key, ':', I.isString(source) ? source : record(source));
        comma = ',';
      }
    }
    accu.push('}');
    return accu.join('');
  }
}