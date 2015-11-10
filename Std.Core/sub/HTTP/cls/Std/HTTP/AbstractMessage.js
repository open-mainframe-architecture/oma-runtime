'BaseObject'.subclass(function(I) {
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
    build: function(headers_, body) {
      I.$super.build.call(this);
      this.messageHeaders_ = headers_;
      this.messageBody = body;
    },
    enumerateHeaders: function(visit) {
      return I.enumerate(this.messageHeaders_, visit);
    },
    getBody: function() {
      return this.messageBody;
    },
    getHeader: function(name) {
      return this.messageHeaders_[name];
    }
  });
})