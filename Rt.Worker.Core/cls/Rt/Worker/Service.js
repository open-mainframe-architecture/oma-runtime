'Env.Service'.subclass(function(I) {
  "use strict";
  /*global self*/
  I.am({
    Abstract: false
  });
  I.peek({
    globalScope: function() {
      return self;
    }
  });
  I.play({
    initialize: function() {
      I.$superRole.initialize.call(this);
      console.log('booting worker', this.$rt.getUptime());
    }
  });
})