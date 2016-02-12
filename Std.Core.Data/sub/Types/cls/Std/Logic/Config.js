'super'.subclass({
  data$: 'Std.Data'
}, function (I) {
  "use strict";
  I.access({
    //@{Rt.Table} get configured type definitions
    datatypes: function () {
      return this.getTable('datatypes');
    }
  });
  I.refine({
    installModule: function (module) {
      I.$former.installModule.call(this, module);
      I.data$.defineTypes('', this.datatypes);
    }
  });
})