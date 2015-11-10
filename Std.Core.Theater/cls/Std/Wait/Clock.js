'BaseObject+Indirect+Eventful'.subclass(function(I) {
  "use strict";
  I.am({
    Service: true
  });
  I.know({
    // get current clock time
    get: function() {
      return this.$rt.getUptime();
    },
    delays: function(seconds) {
      return this.createEvent(seconds || 0);
    }
  });
})