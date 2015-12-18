'BaseObject'.subclass(function (I) {
  "use strict";
  // I describe what HTTP requests and responses have in common.
  I.am({
    Abstract: false
  });
  I.have({
    // table with header names (lower-case) and values
    messageHeaders_: null,
    // message body with data
    messageBody: null
  });
  I.know({
    build: function (headers_, body) {
      I.$super.build.call(this);
      var table = I.createTable();
      for (var headerName in headers_) {
        // header names are case-insensitive
        table[headerName.toLowerCase()] = headers_[headerName];
      }
      this.messageHeaders_ = table;
      this.messageBody = body;
    },
    enumerateHeaders: function (visit) {
      return I.enumerate(this.messageHeaders_, visit);
    },
    getBody: function () {
      return this.messageBody;
    },
    getHeader: function (name) {
      return this.messageHeaders_[name];
    }
  });
})