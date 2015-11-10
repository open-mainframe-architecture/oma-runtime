'AbstractMessage'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    requestMethod: null,
    requestURL: null
  });
  I.know({
    build: function(method, url, headers_, body) {
      I.$super.build.call(this, headers_, body);
      this.requestMethod = method;
      this.requestURL = url;
    },
    getMethod: function() {
      return this.requestMethod;
    },
    getURL: function() {
      return this.requestURL;
    }
  });
})