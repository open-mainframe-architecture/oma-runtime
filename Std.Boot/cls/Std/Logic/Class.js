//@ I describe how the instance side of a class behaves.
'Behavior'.subclass(I => {
  "use strict";
  const Field = I._.Field, Metaclass = I._.Metaclass;
  I.know({
    //@ Add package field substance to this class and add new package field to the metaclass.
    //@param module {Std.Logic.Module} module that defines package field
    //@param fieldClass {Std.Logic.Field.$} class of package field
    //@param key {string} unique key of package field
    //@param substance {any} field substance
    //@return nothing
    addPackageField: function(module, fieldClass, key, substance) {
      const metaclsPackage = this.$.getPackage();
      metaclsPackage.store(fieldClass.create(metaclsPackage, key, module, substance, false), key);
      this.getPackage().storeConstant(substance, key);
    },
    //@ Add package field substances to this class and add new package fields to the metaclass.
    //@param module {Std.Logic.Module} module that defines package fields
    //@param fields_ {Std.Table} mapping from field keys to package field specifications
    //@return nothing
    addPackageFields: function(module, fields_) {
      for (let key in fields_) {
        this.addPackageField(module, Field, key, fields_[key]);
      }
    },
    //@ Test whether this behavior is a mixin class.
    //@return {boolean} false
    isMixin: I.returnFalse,
    //@ Prepare this class for a class loader.
    //@param loader {Std.Runtime.Image.ClassLoader} class loader
    //@return nothing
    prepareLoad: I.doNothing,
    //@ Prepare script arguments when loading this class.
    //@param scriptInst {Std.Table} instance side of class script, usually called I
    //@param scriptMeta {Std.Table} class side of class script, usually called We
    //@return nothing
    prepareScript: I.doNothing,
    //@ Create new subclass/metaclass pair that inherits from this class.
    //@param context {Std.Logic.Namespace|Std.Logic.MetaclassPackage} context of new class
    //@param key {string} unique key of new class
    //@param module {Std.Logic.Module} defining module of new class
    //@param legacyConstructor {Std.Closure?} instance constructor of new class or nothing
    //@return {Std.Logic.Class} new class
    subclass: function(context, key, module, legacyConstructor) {
      this.assert(!this.isFinal());
      const metacls = this.$.addNewChildBehavior(Metaclass);
      const instCls = this.addNewChildBehavior(metacls, legacyConstructor);
      I.defineConstant(metacls.getPrototype(), '$', metacls);
      instCls.buildLogical(context, key, module);
      metacls.buildLogical(instCls, '$', module);
      return instCls;
    }
  });
  I.share({
    //@{Std.Logic.ClassPackage.$} class package holds field substances
    BehaviorPackage: I._.ClassPackage
  });
})