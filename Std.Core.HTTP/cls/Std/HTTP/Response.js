//@ An HTTP response from a server.
'AbstractMessage'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    responseCode: null,
    responseStatus: null
  });
  I.know({
    //@param code {integer} HTTP status code
    //@param status {string} HTTP status name
    //@param headers_ {Object|Std.Table} message header names and values
    //@param body {string|binary} message body
    build: function(code, status, headers_, body) {
      I.$super.build.call(this, headers_, body);
      this.responseCode = code;
      this.responseStatus = status;
    },
    //@ Get status code.
    //@return {integer} code from HTTP constants
    getCode: function() {
      return this.responseCode;
    },
    //@ Get status name.
    //@return {string} name from HTTP constants
    getStatus: function() {
      return this.responseStatus;
    }
  });
})