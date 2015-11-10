function refine(I) {
  "use strict";
  I.know({
    // add type definitions from module configuration
    defineTypes: function(home, definitions_) {
      for (var key in definitions_) {
        if (!Key.test(key)) {
          this.bad('type definition', key);
        }
        var source = definitions_[key];
        var name = home ? home + '.' + key : key;
        if (typeof source === 'string') {
          this.defineType(name, source);
        } else {
          for (var probe in source) {
            if (Key.test(probe)) {
              // recursively add types to the specified home
              this.defineTypes(name, source);
            } else {
              // compute source of record type from specified fields
              this.defineType(name, record(source));
            }
            break;
          }
        }
      }
    }
  });
  var Key = /^[A-Z][0-9A-Za-z]+$/;
  // compute source of record type from module configuration
  function record(fields_) {
    var accu = [];
    if (fields_.$macro) {
      accu.push('(');
      for (var i = 0, n = fields_.$macro.length; i < n; ++i) {
        accu.push(i ? ',' : '', fields_.$macro[i]);
      }
      accu.push(')');
    }
    if (fields_.$super) {
      accu.push(fields_.$super, '+');
    }
    accu.push('{');
    var comma = '';
    for (var key in fields_) {
      if (key.charAt(0) !== '$') {
        var source = fields_[key];
        accu.push(comma, key, ':', typeof source === 'string' ? source : record(source));
        comma = ',';
      }
    }
    accu.push('}');
    return accu.join('');
  }
}