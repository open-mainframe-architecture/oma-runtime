'super'.subclass({
  // configured type definitions are added to the default typespace of the runtime system
  typespace$: 'Std.Data.Typespace'
}, I => {
  "use strict";
  I.access({
    //@{Std.Table} get configured type definitions
    datatypes: function() {
      return this._.datatypes || I.createTable();
    }
  });
  I.refine({
    installModule: function(module) {
      I.$former.installModule.call(this, module);
      I.typespace$.defineTypes(this.datatypes);
    }
  });
})