//@ An HTTP message is a request or a response.
'BaseObject'.subclass(function(I) {
  "use strict";
  I.am({
    Abstract: false
  });
  I.have({
    //@{Std.Table} table with header names (lower-case) and values
    messageHeaders_: null,
    //@{string|binary} message body with textual or binary data
    messageBody: null
  });
  I.know({
    //@param headers_ {Object|Std.Table} headers with raw names
    //@param body {string|binary} textual or binary body
    build: function(headers_, body) {
      I.$super.build.call(this);
      var table = I.createTable();
      for (var headerName in headers_) {
        // header names are case-insensitive
        table[headerName.toLowerCase()] = headers_[headerName];
      }
      this.messageHeaders_ = table;
      this.messageBody = body;
    },
    //@ Enumerate message headers.
    //@param visit {Std.Closure} called with header value and name
    //@return {boolean} false if a visit returned false, otherwise true
    enumerateHeaders: function(visit) {
      return I.enumerate(this.messageHeaders_, visit);
    },
    //@ Get textual or binary body.
    //@return {string|binary} message body
    getBody: function() {
      return this.messageBody;
    },
    //@ Get header value.
    //@param name {string} case-insensitive header name
    //@return {string?} header value or nothing
    getHeader: function(name) {
      return this.messageHeaders_[name.toLowerCase()];
    }
  });
})