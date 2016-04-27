'super'.subclass({
  // configured type definitions are added to the default typespace of the runtime system
  data$: 'Std.Data'
}, I => {
  "use strict";
  I.access({
    //@{Std.Table} get configured type definitions
    datatypes: function() {
      return this.getTable('datatypes');
    }
  });
  I.refine({
    installModule: function(module) {
      I.$former.installModule.call(this, module);
      I.data$.defineTypes(this.datatypes);
    }
  });
})