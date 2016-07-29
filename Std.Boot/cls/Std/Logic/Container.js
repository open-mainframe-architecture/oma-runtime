//@ A container holds logic objects.
'Logic.Context'.subclass(I => {
  "use strict";
  I.have({
    //@{Std.Table} table that maps keys to contained logic objects
    _: null
  });
  I.know({
    //@param parentContext {Std.Logic.Context} parent context of this container
    //@param module {Std.Logic.Module} defining module
    //@param parentContainer {Std.Logic.Container?} parent container or nothing
    build: function(parentContext, key, module, parentContainer) {
      I.$super.build.call(this, parentContext, key, module);
      // container inherits from a parent container, if any
      this._ = I.createTable(parentContainer && parentContainer._);
    },
    select: function(key) {
      const this_ = this._;
      if (I.isPropertyOwner(this_, key)) {
        // select object if owned by this container
        return this_[key];
      }
    },
    //@ Update this container with new logic object.
    //@param key {string} key of new logic object
    //@param object {Std.Logic.Object} new logic object
    //@return nothing
    update: function(key, object) {
      I.lockProperty(this._, key, object);
    }
  });
})