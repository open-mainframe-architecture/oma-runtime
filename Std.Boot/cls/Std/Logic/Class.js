//@ I describe how the instance side of a class behaves.
'Behavior'.subclass(I => {
  "use strict";
  const Metaclass = I._.Metaclass;
  I.know({
    build: function(container, key, module) {
      I.$super.build.call(this, container, key, module);
      // add class to namespace or metaclass package
      container.update(key, this);
    },
    isClass: I.returnTrue,
    getPackageClass: I.returnWith(I._.ClassPackage),
    //@ Add package field constants to this class.
    //@param constants {object|Std.Table} mapping from field keys to package field constants
    //@return nothing
    addPackageFields: function(constants) {
      const classPackage = this.getPackage();
      for (let key in constants) {
        classPackage.update(key, constants[key]);
      }
    },
    //@ Prepare script arguments when loading this class.
    //@param scriptInst {Std.Table} instance side of class script, usually called I
    //@param scriptMeta {Std.Table} class side of class script, usually called We
    //@return nothing
    prepareScript: I.doNothing,
    //@ Create new subclass/metaclass pair that inherits from this class.
    //@param container {Std.Logic.Namespace|Std.Logic.MetaclassPackage} container of new class
    //@param key {string} unique key of new class
    //@param module {Std.Logic.Module} defining module of new class
    //@param constructor {function?} instance constructor of new class or nothing
    //@return {Std.Logic.Class} new class
    subclass: function(container, key, module, constructor) {
      const metacls = this.$.addNewChildBehavior(Metaclass);
      const instCls = this.addNewChildBehavior(metacls, constructor);
      // the class is the only instance of the metaclass
      I.lockProperty(metacls.getPrototype(), '$', metacls);
      instCls.build(container, key, module);
      metacls.build(instCls, '$', module);
      return instCls;
    }
  });
})