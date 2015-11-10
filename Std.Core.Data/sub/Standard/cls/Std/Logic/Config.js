'super'.subclass({
  $data: 'Std.Data'
}, function(I) {
  "use strict";
  I.access({
    datatype: function() {
      return this.getTable('datatype');
    }
  });
  I.refine({
    installModule: function(module) {
      I.$former.installModule.call(this, module);
      I.$data.defineTypes('', this.datatype);
    }
  });
})