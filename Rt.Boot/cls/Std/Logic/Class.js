'Behavior'.subclass(function (I) {
  "use strict";
  // I describe how class objects behave.
  I.know({
    // add package field substance to this class and add new package field to the metaclass
    addPackageField: function (module, Field, key, substance) {
      var metaclsPackage = this.$.getPackage();
      metaclsPackage.store(Field.create(metaclsPackage, key, module, substance), key);
      this.getPackage().storeConstant(substance, key);
    },
    // add package field substances to this class and add new package fields to the metaclass
    addPackageFields: function (module, fields_) {
      for (var key in fields_) {
        var Field = typeof fields_[key] === 'function' ? I._.Subroutine : I._.PackageConstant;
        this.addPackageField(module, Field, key, fields_[key]);
      }
    },
    isMixin: I.returnFalse,
    prepareLoad: I.doNothing,
    prepareScript: I.doNothing,
    // create new subclass/metaclass pair that inherits from this class
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
    // class package with package field substances
    BehaviorPackage: I._.ClassPackage
  });
})