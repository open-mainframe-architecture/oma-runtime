//@ An HTTP request from a client.
'Message'.subclass(I => {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{string} HTTP method of this request
    requestMethod: null,
    //@{Std.HTTP.URI} request URI
    requestURI: null
  });
  I.know({
    //@param method {string} HTTP method from constants
    //@param uri {Std.HTTP.URI} request URI
    //@param headers {object|Std.Table} message header names and values
    //@param body {string|binary} message body
    build: function(method, uri, headers, body) {
      I.$super.build.call(this, headers, body);
      this.requestMethod = method;
      this.requestURI = uri;
    },
    //@ Get HTTP method.
    //@return {string} method name, e.g. GET or POST
    getMethod: function() {
      return this.requestMethod;
    },
    //@ Get request URI.
    //@return {Std.HTTP.URI} request URI
    getURI: function() {
      return this.requestURI;
    }
  });
})