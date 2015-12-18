'AbstractMessage'.subclass(function (I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    responseCode: null,
    responseStatus: null
  });
  I.know({
    build: function (code, status, headers_, body) {
      I.$super.build.call(this, headers_, body);
      this.responseCode = code;
      this.responseStatus = status;
    },
    getCode: function () {
      return this.responseCode;
    },
    getStatus: function () {
      return this.responseStatus;
    }
  });
})