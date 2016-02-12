//@ A namespace contains classes, modules and namespaces.
'LogicalContainer'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    //@param parentNamespace {Std.Logic.Namespace} context of this namespace
    //@param key {string} unique key of this namespace
    //@param module {Std.Logic.Module} defining module
    build: function (parentNamespace, key, module) {
      I.$super.build.call(this, parentNamespace, parentNamespace, key, module);
      parentNamespace.store(this, key);
    },
    checkStorage: function (it, ix) {
      return I.$super.checkStorage.call(this, it, ix) &&
        (I._.Class.describes(it) || I.$.describes(it) || I._.Module.describes(it));
    },
    //@ Evaluate an expression that designates a class
    //@param classExpr {string} class expression, e.g. BaseObject+Indirect
    //@return {Std.Logic.Class?} class or nothing if expression cannot be evaluated
    evaluateClassExpression: function (classExpr) {
      var parts = classExpr.split('+');
      var n = parts.length;
      var i;
      for (i = 0; i < n; ++i) {
        // resolve expression parts relative to this namespace
        parts[i] = this.resolve(parts[i].trim());
        // first part must be class, other parts must be mixins
        if (!I._.Class.describes(parts[i]) || i && !parts[i].isMixin()) {
          return;
        }
      }
      var instCls = parts[0];
      for (i = 1; i < n && instCls; ++i) {
        // find mixed-in classes in specified order 
        instCls = parts[i].getMixedClass(instCls);
      }
      return instCls;
    }
  });
})