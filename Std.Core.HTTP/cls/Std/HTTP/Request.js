//@ An HTTP request from a client.
'AbstractMessage'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{string} HTTP method of this request
    requestMethod: null,
    //@{Std.HTTP.URL} URL of this request
    requestURL: null
  });
  I.know({
    //@param method {string} HTTP method from constants
    //@param url {Std.HTTP.URL} URL of this request
    //@param headers_ {Object|Std.Table} message header names and values
    //@param body {string|binary} message body
    build: function(method, url, headers_, body) {
      I.$super.build.call(this, headers_, body);
      this.requestMethod = method;
      this.requestURL = url;
    },
    //@ Get HTTP method.
    //@return {string} method name, e.g. GET or POST
    getMethod: function() {
      return this.requestMethod;
    },
    //@ Get URL.
    //@return {Std.HTTP.URL} request URL
    getURL: function() {
      return this.requestURL;
    }
  });
})