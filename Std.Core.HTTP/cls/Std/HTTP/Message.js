//@ An HTTP message is a request or a response.
'Object'.subclass(I => {
  "use strict";
  I.am({
    Abstract: true
  });
  I.have({
    //@{Std.Table} table with header names (lower-case) and values
    messageHeaders: null,
    //@{string|binary} message body with textual or binary data
    messageBody: null
  });
  I.know({
    //@param headers {object|Std.Table} headers with raw names
    //@param body {string|binary} textual or binary body
    build: function(headers, body) {
      I.$super.build.call(this);
      const table = I.createTable();
      for (let headerName in headers) {
        // header names are case-insensitive
        table[headerName.toLowerCase()] = headers[headerName];
      }
      this.messageHeaders = table;
      this.messageBody = body;
    },
    //@ Get textual or binary body.
    //@return {string|binary} message body
    getBody: function() {
      return this.messageBody;
    },
    //@ Get iterable header names.
    //@return {iterable} iterable header names
    iterateHeaderNames: function() {
      return Object.keys(this.messageHeaders)[Symbol.iterator]();
    },
    //@ Get header value.
    //@param name {string} case-insensitive header name
    //@return {string?} header value or nothing
    selectHeader: function(name) {
      return this.messageHeaders[name.toLowerCase()];
    }
  });
})