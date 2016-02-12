//@ I describe how the instance side of a class behaves.
'Behavior'.subclass(function (I) {
  "use strict";
  I.know({
    //@ Add package field substance to this class and add new package field to the metaclass.
    //@param module {Std.Logic.Module} module that defines package field
    //@param Field {Std.Logic.Class} class of package field
    //@param key {string} unique key of package field
    //@param substance {any} field substance
    //@return nothing
    addPackageField: function (module, Field, key, substance) {
      var metaclsPackage = this.$.getPackage();
      metaclsPackage.store(Field.create(metaclsPackage, key, module, substance), key);
      this.getPackage().storeConstant(substance, key);
    },
    //@ Add package field substances to this class and add new package fields to the metaclass.
    //@param module {Std.Logic.Module} module that defines package fields
    //@param fields_ {Rt.Table} mapping from field keys to package field specifications
    addPackageFields: function (module, fields_) {
      for (var key in fields_) {
        var Field = typeof fields_[key] === 'function' ? I._.Subroutine : I._.PackageConstant;
        this.addPackageField(module, Field, key, fields_[key]);
      }
    },
    //@ Test whether this behavior is a mixin class.
    //@return {boolean} false
    isMixin: I.returnFalse,
    //@ Prepare this class for a class loader.
    //@param loader {Rt.Image.ClassLoader} class loader
    prepareLoad: I.doNothing,
    //@ Prepare script arguments when loading this class.
    //@param scriptInst {Rt.Table} instance side of class script, usually called I
    //@param scriptMeta {Rt.Table} class side of class script, usually called We
    //@return nothing
    prepareScript: I.doNothing,
    //@ Create new subclass/metaclass pair that inherits from this class.
    //@param context {Std.Logic.Namespace|Std.Logic.MetaclassPackage} context of new class
    //@param key {string} unique key of new class
    //@param module {Std.Logic.Module} defining module of new class
    //@param legacyConstructor {Rt.Closure?} instance constructor of new class or nothing
    //@return {Std.Logic.Class} new class
    subclass: function (context, key, module, legacyConstructor) {
      if (this.isFinal()) {
        this.bad('subclass', key);
      }
      var metacls = this.$.addNewChildBehavior(I._.Metaclass);
      var instCls = this.addNewChildBehavior(metacls, legacyConstructor);
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