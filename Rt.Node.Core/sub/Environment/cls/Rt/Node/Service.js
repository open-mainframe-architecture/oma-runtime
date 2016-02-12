//@ A Node.js runtime environment.
'Env.Service'.subclass(['Std.Core.Runtime'], function (I) {
  "use strict";
  /*global global,process*/
  I.am({
    Abstract: false
  });
  I.peek({
    globalScope: function () {
      return global;
    },
    isSubsidiary: function() {
      return !!process.send;
    }
  });
  I.play({
    initialize: function () {
      I.$superRole.initialize.call(this);
      console.log('booting node', this.$rt.getUptime());
    }
  });
})