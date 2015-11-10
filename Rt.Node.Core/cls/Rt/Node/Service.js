'Env.Service'.subclass(function(I) {
  "use strict";
  /*global global*/
  I.am({
    Abstract: false
  });
  I.peek({
    globalScope: function() {
      return global;
    }
  });
  I.play({
    initialize: function() {
      I.$superRole.initialize.call(this);
      console.log('booting node', this.$rt.getUptime());
    }
  });
})