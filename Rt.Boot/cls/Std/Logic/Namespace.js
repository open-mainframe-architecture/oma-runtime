'LogicalContainer'.subclass(function (I) {
  "use strict";
  // I describe a container that holds classes, modules and namespaces.
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    build: function (parentNamespace, key, module) {
      I.$super.build.call(this, parentNamespace, parentNamespace, key, module);
      parentNamespace.store(this, key);
    },
    checkStorage: function (it, ix) {
      return I.$super.checkStorage.call(this, it, ix) &&
        (I._.Class.describes(it) || I.$.describes(it) || I._.Module.describes(it));
    },
    // evaluate an expression that designates a class, e.g. BaseObject+Indirect
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