'super'.subclass({
  data$: 'Std.Data'
}, function(I) {
  "use strict";
  I.access({
    datatypes: function() {
      return this.getTable('datatypes');
    }
  });
  I.refine({
    installModule: function(module) {
      I.$former.installModule.call(this, module);
      I.data$.defineTypes('', this.datatypes);
    }
  });
})