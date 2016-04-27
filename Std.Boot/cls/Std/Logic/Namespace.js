//@ A namespace contains classes, modules and namespaces.
'LogicalContainer'.subclass(I => {
  "use strict";
  const Class = I._.Class, Module = I._.Module;
  I.am({
    Abstract: false
  });
  I.know({
    //@param parentNamespace {Std.Logic.Namespace} context of this namespace
    //@param key {string} unique key of this namespace
    //@param module {Std.Logic.Module} defining module
    build: function(parentNamespace, key, module) {
      I.$super.build.call(this, parentNamespace, parentNamespace, key, module);
      parentNamespace.store(this, key);
    },
    checkStorage: function(it, ix) {
      return I.$super.checkStorage.call(this, it, ix) &&
        (Class.describes(it) || I.$.describes(it) || Module.describes(it));
    },
    //@ Evaluate an expression that designates a class
    //@param classExpr {string} class expression, e.g. BaseObject+Indirect
    //@return {Std.Logic.Class?} class or nothing if expression cannot be evaluated
    evaluateClassExpression: function(classExpr) {
      const parts = classExpr.split('+'), n = parts.length;
      for (let i = 0; i < n; ++i) {
        // resolve expression parts relative to this namespace
        parts[i] = this.resolve(parts[i].trim());
        // first part must be class, other parts must be mixins
        if (!Class.describes(parts[i]) || i && !parts[i].isMixin()) {
          return;
        }
      }
      let instCls = parts[0];
      for (let i = 1; i < n && instCls; ++i) {
        // find mixed-in classes in specified order 
        instCls = parts[i].getMixedClass(instCls);
      }
      return instCls;
    }
  });
})