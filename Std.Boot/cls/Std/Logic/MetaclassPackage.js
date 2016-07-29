//@ A metaclass package is the container of nested classes.
'Container'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false,
    Final: true
  });
  I.know({
    //@ This must match construction arguments of ClassPackage.
    //@param metacls {Std.Logic.Metaclass} metaclass that owns this package
    //@param key {string} unique key of this package
    build: function(metacls, key) {
      const parentPackage = metacls.getParentBehavior().getPackage();
      I.$super.build.call(this, metacls, key, metacls.getModule(), parentPackage);
    },
    //@param key {string} key of nested class
    //@param nestedClass {Std.Logic.Class} nested class
    update: function(key, nestedClass) {
      I.$super.update.call(this, key, nestedClass);
      // from this metaclass package to metaclass to instance class to class package
      const classPackage = this.getContext().getContext().getPackage();
      // add nested class as constant to class package on instance side
      classPackage.update(key, nestedClass);
    }
  });
})