//@ A class package holds package field constants.
'Logic.Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.have({
    //@{Std.Table} table with package field constants
    _: null
  });
  I.know({
    //@ This must match construction arguments of MetaclassPackage.
    //@param instCls {Std.Logic.Class} class that owns this package
    //@param key {string} unique key of this package
    build: function(instCls, key) {
      I.$super.build.call(this, instCls, key);
      this._ = I.createTable(instCls.getParentBehavior()._);
    },
    //@ Update package with new package field constant.
    //@param key {string} package field key
    //@param constant {*} field constant
    //@return nothing
    update: function(key, constant) {
      I.lockProperty(this._, key, constant);
    }
  });
})